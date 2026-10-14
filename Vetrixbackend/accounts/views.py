import logging

from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password, check_password
from django.db import IntegrityError, transaction
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework_simplejwt.tokens import RefreshToken

from .utils import create_and_send_otp, verify_otp
from .models import VETRIXUser, EmailOTP


logger = logging.getLogger(__name__)


# =========================================================
# EMAIL VALIDATION HELPER
# =========================================================

def clean_email(value):
    if not isinstance(value, str):
        return None

    email = value.strip().lower()

    if not email:
        return None

    try:
        validate_email(email)
    except ValidationError:
        return None

    return email


# =========================================================
# USER RESPONSE HELPER
# =========================================================

def public_user_data(user):
    return {
        "id": user.id,
        "vetrix_id": user.vetrix_id,
        "name": user.name,
        "email": user.email,
    }


# =========================================================
# JWT TOKEN HELPER
# =========================================================

def create_user_tokens(user):
    refresh = RefreshToken()

    refresh["user_id"] = user.id
    refresh["email"] = user.email
    refresh["name"] = user.name
    refresh["vetrix_id"] = user.vetrix_id

    access = refresh.access_token

    return {
        "access": str(access),
        "refresh": str(refresh),
    }


# =========================================================
# SEND OTP
# =========================================================

class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = clean_email(request.data.get("email"))

        if not email:
            return Response(
                {"error": "Please provide a valid email address."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            create_and_send_otp(email)

            return Response(
                {"message": "OTP sent successfully."},
                status=status.HTTP_200_OK,
            )

        except Exception:
            logger.exception("Failed to send VETRIX OTP")

            return Response(
                {
                    "error": (
                        "Unable to send OTP. Check the Django terminal "
                        "and email configuration."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# =========================================================
# VERIFY OTP
# New user -> continue registration
# Existing user -> return JWT tokens
# =========================================================

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = clean_email(request.data.get("email"))
        otp = request.data.get("otp")

        if not email or otp is None or not str(otp).strip():
            return Response(
                {"error": "Valid email and OTP are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            otp_is_valid = verify_otp(email, str(otp).strip())

            if not otp_is_valid:
                return Response(
                    {"error": "Invalid or expired OTP."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = VETRIXUser.objects.filter(
                email__iexact=email
            ).first()

            # New user: email verified, registration is next.
            if user is None:
                return Response(
                    {
                        "message": (
                            "Email verified. Please complete registration."
                        ),
                        "email_verified": True,
                        "email": email,
                    },
                    status=status.HTTP_200_OK,
                )

            # Existing user: return tokens.
            tokens = create_user_tokens(user)

            return Response(
                {
                    "message": "OTP verified successfully.",
                    "email_verified": True,
                    "access": tokens["access"],
                    "refresh": tokens["refresh"],
                    "tokens": tokens,
                    "user": public_user_data(user),
                },
                status=status.HTTP_200_OK,
            )

        except Exception:
            logger.exception("Failed to verify VETRIX OTP")

            return Response(
                {
                    "error": (
                        "OTP verification failed. Please try again."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# =========================================================
# REGISTER
# Requires a verified and unexpired OTP
# =========================================================

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get("name")
        email = clean_email(request.data.get("email"))
        password = request.data.get("password")

        if not isinstance(name, str) or not name.strip():
            return Response(
                {"error": "Name is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        name = name.strip()

        if not email or not isinstance(password, str) or not password:
            return Response(
                {"error": "Valid email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                # Check email availability inside the transaction.
                if VETRIXUser.objects.filter(
                    email__iexact=email
                ).exists():
                    return Response(
                        {"error": "User with this email already exists."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # OTP must be verified and not expired.
                verified_otp = EmailOTP.objects.filter(
                    email=email,
                    is_verified=True,
                    expires_at__gte=timezone.now(),
                ).first()

                if verified_otp is None:
                    return Response(
                        {
                            "error": (
                                "Please verify your email with OTP first. "
                                "The OTP may have expired."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                user = VETRIXUser.objects.create(
                    name=name,
                    email=email,
                    password=make_password(password),
                )

                # Generate a unique VETRIX ID.
                user.vetrix_id = f"VTX{user.id:06d}"
                user.save(update_fields=["vetrix_id"])

                # Remove used verified OTP records.
                EmailOTP.objects.filter(
                    email=email,
                    is_verified=True,
                ).delete()

        except IntegrityError:
            logger.exception("VETRIX registration database error")

            return Response(
                {
                    "error": (
                        "Registration could not be completed. "
                        "Please try again."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception:
            logger.exception("Unexpected VETRIX registration error")

            return Response(
                {
                    "error": (
                        "Something went wrong during registration. "
                        "Please try again."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "message": "Registration successful.",
                "user": public_user_data(user),
            },
            status=status.HTTP_201_CREATED,
        )


# =========================================================
# LOGIN + JWT
# =========================================================

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = clean_email(request.data.get("email"))
        password = request.data.get("password")

        if (
            not email
            or not isinstance(password, str)
            or not password
        ):
            return Response(
                {"error": "Valid email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = VETRIXUser.objects.get(email__iexact=email)
        except VETRIXUser.DoesNotExist:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not check_password(password, user.password):
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Backfill VETRIX ID for older accounts.
        if not user.vetrix_id:
            user.vetrix_id = f"VTX{user.id:06d}"
            user.save(update_fields=["vetrix_id"])

        tokens = create_user_tokens(user)

        return Response(
            {
                "message": "Login successful.",
                "access": tokens["access"],
                "refresh": tokens["refresh"],
                "tokens": tokens,
                "user": public_user_data(user),
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# PROFILE
# =========================================================

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response(
            {
                "message": "Profile fetched successfully.",
                "user": public_user_data(user),
            },
            status=status.HTTP_200_OK,
        )

    def put(self, request):
        user = request.user
        name = request.data.get("name")

        if not isinstance(name, str) or not name.strip():
            return Response(
                {"error": "Name is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.name = name.strip()
        user.save(update_fields=["name"])

        return Response(
            {
                "message": "Profile updated successfully.",
                "user": public_user_data(user),
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# CHANGE PASSWORD
# =========================================================

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if (
            not isinstance(current_password, str)
            or not isinstance(new_password, str)
            or not current_password
            or not new_password
        ):
            return Response(
                {
                    "error": (
                        "Current password and new password are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not check_password(current_password, user.password):
            return Response(
                {"error": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 8:
            return Response(
                {"error": "New password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.password = make_password(new_password)
        user.save(update_fields=["password"])

        return Response(
            {"message": "Password changed successfully."},
            status=status.HTTP_200_OK,
        )


# =========================================================
# REFRESH ACCESS TOKEN
# =========================================================

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"error": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            refresh = RefreshToken(refresh_token)

            user_id = refresh.get("user_id")

            if not VETRIXUser.objects.filter(id=user_id).exists():
                return Response(
                    {"error": "User account not found."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            return Response(
                {
                    "message": "Access token refreshed successfully.",
                    "access": str(refresh.access_token),
                },
                status=status.HTTP_200_OK,
            )

        except Exception:
            logger.exception("Failed to refresh VETRIX access token")

            return Response(
                {"error": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
