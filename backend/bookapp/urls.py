from django.urls import path

from . import views

urlpatterns = [
    path("register_user/", views.register_user, name="register_user"),
    path("create_book/", views.create_book, name="create_book"),
    path("book_list", views.book_list, name="book_list"),
    path("books/<slug:slug>", views.get_book, name="get_book"),
    path("update_book/<int:pk>/", views.update_book, name="update_book"),
    path("delete_book/<int:pk>/", views.delete_book, name="delete_book"),
    path("update_user/", views.update_user_profile, name="update_user"),
    path("get_username", views.get_username, name="get_username"),
    path("get_userinfo/<str:username>", views.get_userinfo, name="get_userinfo"),
    path("get_user/<str:email>", views.get_user, name="get_user"),
    path(
        "groups/<slug:slug>", views.get_reading_group, name="get_reading_group"
    ),  # REM
    path("books/<slug:slug>/page", views.get_book, name="get_book_page"),
]
