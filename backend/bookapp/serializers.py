from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Book, ReadingGroup


def text_formating(content):
    processed_data = content
    return processed_data


class UpdateUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "bio",
            "job_title",
            "profile_picture",
            "facebook",
            "youtube",
            "instagram",
            "twitter",
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ["id", "username", "first_name", "last_name", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        username = validated_data["username"]
        first_name = validated_data["first_name"]
        last_name = validated_data["last_name"]
        first_name = validated_data["first_name"]
        password = validated_data["password"]

        user = get_user_model()
        new_user = user.objects.create(
            username=username, first_name=first_name, last_name=last_name
        )
        new_user.set_password(password)
        new_user.save()
        return new_user


class SimpleAuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "profile_picture",
        ]


class BookSerializer(serializers.ModelSerializer):
    author = SimpleAuthorSerializer(read_only=True)

    class Meta:
        model = Book

        fields = [
            "id",
            "title",
            "slug",
            "author",
            "category",
            "content",
            "featured_image",
            "published_date",
            "created_at",
            "updated_at",
            "is_draft",
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["processed_content"] = text_formating(representation["content"])

        return representation


class ReadingGroupSerializer(serializers.ModelSerializer):  # REM
    creator = SimpleAuthorSerializer(read_only=True)

    class Meta:
        model = ReadingGroup
        fields = ["id", "name", "slug", "creator", "created_at"]


class UserInfoSerializer(serializers.ModelSerializer):
    author_posts = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "job_title",
            "bio",
            "profile_picture",
            "author_posts",
        ]

    def get_author_posts(self, user):
        books = Book.objects.filter(author=user)[:9]
        serializer = BookSerializer(books, many=True)
        return serializer.data
