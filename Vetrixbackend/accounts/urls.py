from django.urls import path

from .views import (
    SendOTPView,
    VerifyOTPView,
    RegisterView,
    LoginView,
    ProfileView,
    ChangePasswordView,
    RefreshTokenView,
)

from .friends_views import (
    UserSearchView,
    SendFriendRequestView,
    FriendRequestsView,
    RespondFriendRequestView,
    CancelFriendRequestView,
    FriendsListView,
)


urlpatterns = [
    # Existing authentication APIs
    path("send-otp/", SendOTPView.as_view(), name="send-otp"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),
    path(
        "refresh-token/",
        RefreshTokenView.as_view(),
        name="refresh-token",
    ),

    # Friends & Connect APIs
    path("users/search/", UserSearchView.as_view(), name="user-search"),
    path(
        "friends/requests/send/",
        SendFriendRequestView.as_view(),
        name="send-friend-request",
    ),
    path(
        "friends/requests/",
        FriendRequestsView.as_view(),
        name="friend-requests",
    ),
    path(
        "friends/requests/<int:request_id>/respond/",
        RespondFriendRequestView.as_view(),
        name="respond-friend-request",
    ),
    path(
        "friends/requests/<int:request_id>/cancel/",
        CancelFriendRequestView.as_view(),
        name="cancel-friend-request",
    ),
    path("friends/", FriendsListView.as_view(), name="friends-list"),
]
