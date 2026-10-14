from django.db import models
from django.db.models import F, Q


class EmailOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.email


class VETRIXUser(models.Model):
    # Unique ID used for finding friends in VETRIX.
    # Nullable temporarily so existing users are preserved.
    vetrix_id = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
    )

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_authenticated(self):
        return True

    def __str__(self):
        return self.vetrix_id or self.email


class FriendRequest(models.Model):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (ACCEPTED, "Accepted"),
        (REJECTED, "Rejected"),
        (CANCELLED, "Cancelled"),
    ]

    sender = models.ForeignKey(
        VETRIXUser,
        on_delete=models.CASCADE,
        related_name="sent_friend_requests",
    )

    receiver = models.ForeignKey(
        VETRIXUser,
        on_delete=models.CASCADE,
        related_name="received_friend_requests",
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default=PENDING,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["sender", "receiver"],
                name="unique_friend_request_direction",
            ),
            models.CheckConstraint(
                condition=~Q(sender=F("receiver")),
                name="friend_request_not_self",
            ),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.sender.name} -> "
            f"{self.receiver.name} ({self.status})"
        )
