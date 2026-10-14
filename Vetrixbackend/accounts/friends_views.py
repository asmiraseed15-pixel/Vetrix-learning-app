from django.db import transaction
from django.db.models import Q

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import VETRIXUser, FriendRequest


# =========================================================
# SAFE PUBLIC USER DATA
# =========================================================

def public_user_data(user):
    """Return safe profile information for friends features."""
    return {
        "id": user.id,
        "vetrix_id": user.vetrix_id or "",
        "name": user.name,
    }


# =========================================================
# CHECK FRIENDSHIP STATUS
# =========================================================

def get_friend_status(current_user, other_user):
    if FriendRequest.objects.filter(
        Q(sender=current_user, receiver=other_user)
        | Q(sender=other_user, receiver=current_user),
        status=FriendRequest.ACCEPTED,
    ).exists():
        return "friends"

    if FriendRequest.objects.filter(
        sender=current_user,
        receiver=other_user,
        status=FriendRequest.PENDING,
    ).exists():
        return "request_sent"

    if FriendRequest.objects.filter(
        sender=other_user,
        receiver=current_user,
        status=FriendRequest.PENDING,
    ).exists():
        return "request_received"

    return "none"


# =========================================================
# SEARCH USERS BY NAME OR VETRIX ID
# GET /api/auth/users/search/?q=Asmi
# GET /api/auth/users/search/?q=VTX000002
# =========================================================

class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()

        if len(query) < 2:
            return Response(
                {
                    "count": 0,
                    "results": [],
                    "message": "Enter at least 2 characters to search.",
                },
                status=status.HTTP_200_OK,
            )

        users = (
            VETRIXUser.objects
            .filter(
                Q(name__icontains=query)
                | Q(vetrix_id__iexact=query)
            )
            .exclude(id=request.user.id)
            .order_by("name", "id")[:20]
        )

        results = []

        for user in users:
            item = public_user_data(user)
            item["friend_status"] = get_friend_status(
                request.user, user
            )
            results.append(item)

        return Response(
            {
                "count": len(results),
                "results": results,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# SEND FRIEND REQUEST
# POST /api/auth/friends/requests/send/
# Body: {"user_id": 2}
# =========================================================

class SendFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        target_id = request.data.get("user_id")

        try:
            target_id = int(target_id)
        except (TypeError, ValueError):
            return Response(
                {"error": "A valid user_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if target_id == request.user.id:
            return Response(
                {
                    "error": "You cannot send a friend request to yourself."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            receiver = VETRIXUser.objects.get(id=target_id)
        except VETRIXUser.DoesNotExist:
            return Response(
                {"error": "VETRIX user not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        with transaction.atomic():
            # Automatically accept if the other user already
            # sent a pending request to the current user.
            reverse_request = FriendRequest.objects.filter(
                sender=receiver,
                receiver=request.user,
                status=FriendRequest.PENDING,
            ).first()

            if reverse_request:
                reverse_request.status = FriendRequest.ACCEPTED
                reverse_request.save(
                    update_fields=["status", "updated_at"]
                )

                return Response(
                    {
                        "message": (
                            "Friend request accepted. "
                            "You are now friends."
                        ),
                        "friend": public_user_data(receiver),
                    },
                    status=status.HTTP_200_OK,
                )

            existing = FriendRequest.objects.filter(
                sender=request.user,
                receiver=receiver,
            ).first()

            if existing:
                if existing.status == FriendRequest.ACCEPTED:
                    return Response(
                        {"message": "You are already friends."},
                        status=status.HTTP_200_OK,
                    )

                if existing.status == FriendRequest.PENDING:
                    return Response(
                        {"message": "Friend request already sent."},
                        status=status.HTTP_200_OK,
                    )

                # Reuse rejected/cancelled request records.
                existing.status = FriendRequest.PENDING
                existing.save(
                    update_fields=["status", "updated_at"]
                )

                return Response(
                    {"message": "Friend request sent successfully."},
                    status=status.HTTP_201_CREATED,
                )

            FriendRequest.objects.create(
                sender=request.user,
                receiver=receiver,
            )

        return Response(
            {"message": "Friend request sent successfully."},
            status=status.HTTP_201_CREATED,
        )


# =========================================================
# VIEW INCOMING FRIEND REQUESTS
# GET /api/auth/friends/requests/
# =========================================================

class FriendRequestsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        requests = (
            FriendRequest.objects
            .filter(
                receiver=request.user,
                status=FriendRequest.PENDING,
            )
            .select_related("sender")
            .order_by("-created_at")
        )

        results = []

        for friend_request in requests:
            results.append(
                {
                    "request_id": friend_request.id,
                    "sender": public_user_data(
                        friend_request.sender
                    ),
                    "created_at": friend_request.created_at,
                }
            )

        return Response(
            {
                "count": len(results),
                "results": results,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# ACCEPT OR REJECT FRIEND REQUEST
# POST /api/auth/friends/requests/<request_id>/respond/
# Body: {"action": "accept"} or {"action": "reject"}
# =========================================================

class RespondFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):
        action = request.data.get("action")

        if action not in ["accept", "reject"]:
            return Response(
                {
                    "error": "Action must be 'accept' or 'reject'."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            friend_request = FriendRequest.objects.get(
                id=request_id,
                receiver=request.user,
                status=FriendRequest.PENDING,
            )
        except FriendRequest.DoesNotExist:
            return Response(
                {"error": "Pending friend request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if action == "accept":
            friend_request.status = FriendRequest.ACCEPTED
            message = "Friend request accepted."
        else:
            friend_request.status = FriendRequest.REJECTED
            message = "Friend request rejected."

        friend_request.save(
            update_fields=["status", "updated_at"]
        )

        return Response(
            {
                "message": message,
                "user": public_user_data(friend_request.sender),
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# CANCEL OUTGOING FRIEND REQUEST
# POST /api/auth/friends/requests/<request_id>/cancel/
# =========================================================

class CancelFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):
        try:
            friend_request = FriendRequest.objects.get(
                id=request_id,
                sender=request.user,
                status=FriendRequest.PENDING,
            )
        except FriendRequest.DoesNotExist:
            return Response(
                {"error": "Pending outgoing request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        friend_request.status = FriendRequest.CANCELLED
        friend_request.save(
            update_fields=["status", "updated_at"]
        )

        return Response(
            {"message": "Friend request cancelled."},
            status=status.HTTP_200_OK,
        )


# =========================================================
# LIST ACCEPTED FRIENDS
# GET /api/auth/friends/
# =========================================================

class FriendsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        accepted = (
            FriendRequest.objects
            .filter(
                Q(sender=request.user)
                | Q(receiver=request.user),
                status=FriendRequest.ACCEPTED,
            )
            .select_related("sender", "receiver")
        )

        friends = []

        for item in accepted:
            if item.sender_id == request.user.id:
                friend = item.receiver
            else:
                friend = item.sender

            friends.append(
                {
                    **public_user_data(friend),
                    "connected_at": item.updated_at,
                }
            )

        friends.sort(
            key=lambda item: item["name"].lower()
        )

        return Response(
            {
                "count": len(friends),
                "results": friends,
            },
            status=status.HTTP_200_OK,
        )