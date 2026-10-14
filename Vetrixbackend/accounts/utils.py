import random
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.utils import timezone

from .models import EmailOTP


def generate_otp():
    return str(random.randint(100000, 999999))


def create_and_send_otp(email):
    # Validate and normalize the email address
    if not isinstance(email, str):
        raise ValueError("A valid email address is required.")

    email = email.strip().lower()

    if not email:
        raise ValueError("Email address cannot be empty.")

    try:
        validate_email(email)
    except ValidationError:
        raise ValueError("Please provide a valid email address.")

    # Check sender email configuration
    sender_email = (
        getattr(settings, "EMAIL_HOST_USER", "")
        or getattr(settings, "DEFAULT_FROM_EMAIL", "")
    )

    if not sender_email or not sender_email.strip():
        raise ValueError(
            "Sender email is not configured. "
            "Set VETRIX_EMAIL_USER in your environment."
        )

    otp = generate_otp()
    expires_at = timezone.now() + timedelta(minutes=5)

    # Remove previous unverified OTPs
    EmailOTP.objects.filter(
        email=email,
        is_verified=False,
    ).delete()

    # Save new OTP
    EmailOTP.objects.create(
        email=email,
        otp=otp,
        expires_at=expires_at,
    )

    # Send verification email
    send_mail(
        subject="Your VETRIX Verification Code",
        message=(
            "Welcome to VETRIX!\n\n"
            f"Your verification code is: {otp}\n\n"
            "This code will expire in 5 minutes.\n\n"
            "If you did not request this code, please ignore this email.\n\n"
            "VETRIX by Vetri Technology"
        ),
        from_email=sender_email.strip(),
        recipient_list=[email],
        fail_silently=False,
    )

    return True


def verify_otp(email, otp):
    if not isinstance(email, str) or not isinstance(otp, str):
        return False

    email = email.strip().lower()
    otp = otp.strip()

    try:
        otp_record = EmailOTP.objects.get(
            email=email,
            otp=otp,
            is_verified=False,
        )
    except EmailOTP.DoesNotExist:
        return False

    if timezone.now() > otp_record.expires_at:
        otp_record.delete()
        return False

    otp_record.is_verified = True
    otp_record.save(update_fields=["is_verified"])

    return True

