from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import VETRIXUser


class VETRIXJWTAuthentication(JWTAuthentication):

    def authenticate(self, request):

        header = self.get_header(request)

        if header is None:
            return None

        raw_token = self.get_raw_token(header)

        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)

        except Exception:
            raise AuthenticationFailed("Invalid or expired token.")

        user_id = validated_token.get("user_id")

        if not user_id:
            raise AuthenticationFailed("User ID not found in token.")

        try:
            user = VETRIXUser.objects.get(id=user_id)

        except VETRIXUser.DoesNotExist:
            raise AuthenticationFailed("User not found.")

        return (user, validated_token)