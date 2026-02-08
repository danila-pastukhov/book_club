"""
Reward management views.

Handles reward template creation and user reward tracking.
"""

import logging
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import (
    RewardTemplate,
    UserReward,
    UserRewardSummary,
    ReadingGroup,
    PrizeBoardCell,
)
from ..serializers import (
    RewardTemplateSerializer,
    UserRewardSerializer,
    UserRewardSummarySerializer,
)

logger = logging.getLogger(__name__)


# Reward Templates


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_reward_templates(request):
    """Get all reward templates."""
    templates = RewardTemplate.objects.all()

    serializer = RewardTemplateSerializer(templates, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_reward_template(request):
    """Create a reward template (admin for global, group leader for group)."""
    user = request.user
    reading_group_id = request.data.get("reading_group")

    # Check permissions
    if reading_group_id:
        try:
            reading_group = ReadingGroup.objects.get(id=reading_group_id)
            if reading_group.creator != user:
                return Response(
                    {"error": "Only group leaders can create group rewards"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        except ReadingGroup.DoesNotExist:
            return Response(
                {"error": "Reading group not found"}, status=status.HTTP_404_NOT_FOUND
            )
    elif not user.is_staff:
        return Response(
            {"error": "Only admins can create global rewards"},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = RewardTemplateSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_reward_template(request, template_id):
    """Delete a reward template (superuser only)."""
    if not request.user.is_superuser:
        return Response(
            {"error": "Only superusers can delete reward templates"},
            status=status.HTTP_403_FORBIDDEN,
        )
    template = get_object_or_404(RewardTemplate, id=template_id)
    if template.image:
        template.image.delete(save=False)
    template.delete()
    return Response({"message": "Шаблон приза удалён"}, status=status.HTTP_200_OK)


# User Rewards


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_my_rewards(request):
    """Get current user's rewards."""
    user = request.user
    rewards = (
        UserReward.objects.filter(user=user)
        .select_related("reward_template", "quest_completed")
        .order_by("-received_at")
    )

    serializer = UserRewardSerializer(rewards, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_my_reward_summaries(request):
    """Get aggregated reward counts for current user."""
    user = request.user
    summaries = (
        UserRewardSummary.objects.filter(user=user)
        .select_related("reward_template", "user")
        .order_by("-last_received_at")
    )
    serializer = UserRewardSummarySerializer(summaries, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_my_reward_placements(request):
    """Get list of user_reward ids placed by the user across all boards."""
    user = request.user
    placed_reward_ids = list(
        PrizeBoardCell.objects.filter(user_reward__user=user).values_list(
            "user_reward_id", flat=True
        )
    )
    return Response({"placed_reward_ids": placed_reward_ids})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_rewards(request, username):
    """Get specific user's rewards."""
    try:
        from django.contrib.auth import get_user_model

        User = get_user_model()
        user = User.objects.get(username=username)

        rewards = (
            UserReward.objects.filter(user=user)
            .select_related("reward_template", "quest_completed")
            .order_by("-received_at")
        )

        serializer = UserRewardSerializer(rewards, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_reward_summaries(request, username):
    """Get aggregated reward counts for a specific user."""
    try:
        from django.contrib.auth import get_user_model

        User = get_user_model()
        user = User.objects.get(username=username)

        summaries = (
            UserRewardSummary.objects.filter(user=user)
            .select_related("reward_template", "user")
            .order_by("-last_received_at")
        )
        serializer = UserRewardSummarySerializer(summaries, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
