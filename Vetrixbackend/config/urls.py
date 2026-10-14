from django.contrib import admin
from django.urls import include, path


urlpatterns = [

    # Django Admin
    path(
        "admin/",
        admin.site.urls
    ),

    # Accounts APIs
    path(
        "api/auth/",
        include("accounts.urls")
    ),

    # Learning APIs
    path(
        "api/learning/",
        include("learning.urls")
    ),
]

