"""
Signals for automatic quest progress tracking.

This module handles automatic updates to quest progress when users perform
actions like creating comments, completing books, or placing rewards.
"""

import logging
from django.db import transaction
from django.db.models import F, Sum, Q
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone

from .models import (
    BookComment,
    Notification,
    PrizeBoardCell,
    Quest,
    QuestCompletion,
    QuestProgress,
    ReadingProgress,
    UserReward,
    UserRewardSummary,
    UserStats,
    Book,
    UserToReadingGroupState
)

logger = logging.getLogger(__name__)

def update_reward_summary(user, reward_template):
    """Recalculate reward summary for a user and reward template."""
    total_count = UserReward.objects.filter(
        user=user,
        reward_template=reward_template,
    ).count()

    summary, _ = UserRewardSummary.objects.get_or_create(
        user=user,
        reward_template=reward_template,
    )

    summary.total_count = total_count
    latest_reward = (
        UserReward.objects.filter(
            user=user,
            reward_template=reward_template,
        )
        .order_by("-received_at")
        .first()
    )
    summary.last_received_at = latest_reward.received_at if latest_reward else None
    summary.save()


@transaction.atomic
def update_quest_progress(user, quest_type, obj_reading_group=None, obj=None):
    """
    Update progress for all active quests of a specific type for a user.

    Args:
        user: The user performing the action
        quest_type: Type of quest ('read_books', 'create_comments', 'reply_comments', 'place_rewards')
        obj_reading_group: Optional reading group for group quests
        obj: Optional object related to the quest progress update (e.g., comment, prize placement)
    """
    now = timezone.now()

    logger.debug(f"Updating quest progress for user {user}, quest type '{quest_type}', reading group '{obj_reading_group}' at {now}")
    
    # Find all active quests of this type (lock rows to prevent concurrent modifications)
    
    filter_personal = Q(created_by=user)&Q(participation_type="personal")

    if obj_reading_group:
        filter_group = Q(reading_group=obj_reading_group)&Q(participation_type="group")
    else:
        filter_group = Q()  # No group filter if no reading group provided

    # Special check for book completion quests
    if obj:
        if isinstance(obj, Book):
            if obj.visibility == "public":
                user_groups = UserToReadingGroupState.objects.filter(
                user=user, in_reading_group=True)
                # For public books, include quests from all user's groups
                filter_group = Q(reading_group__in=user_groups.values_list('reading_group', flat=True))


    quests = list(Quest.objects.select_for_update().filter(
        filter_personal | filter_group,
        quest_type=quest_type,
        is_completed=False,
        start_date__lte=now,
        end_date__gte=now,
    ))

    logger.debug(f"Found {len(quests)} active quests of type '{quest_type}' for user {user.username}")

    for quest in quests:

        logger.debug(f"Processing quest '{quest.title}' (ID: {quest.id}) for user {user.username}")
        # Get or create progress (lock row to prevent concurrent modifications)
        progress, created = QuestProgress.objects.select_for_update().get_or_create(
            quest=quest, user=user, defaults={"current_count": 0}
        )

        # Atomic increment at DB level to prevent lost updates
        progress.current_count = F('current_count') + 1
        progress.save(update_fields=['current_count'])
        progress.refresh_from_db()

        logger.debug(f"Updated progress for quest '{quest.title}' (ID: {quest.id}): current_count={progress.current_count} (was created: {created})")

        # В случае группового квеста нужно посчитать суммарный прогресс всех участников данного квеста
        logger.debug(f"Checking if quest '{quest.title}' type of {quest.participation_type}  quest.id={quest.id}")
        if quest.participation_type == "group":
            total_group_count = QuestProgress.objects.filter(
                quest=quest,
            ).aggregate(total_count=Sum("current_count"))["total_count"] or 0

            progress.current_count = total_group_count
            logger.debug(f"Total group progress for quest '{quest.title}' (ID: {quest.id}): total_group_count={total_group_count}")
        # save не делаем здесь, чтобы не перезаписывать индивидуальный прогресс
        # в блоке выше пересчитывается прогресс для группового квеста


        # Check if quest is completed (reached target)
        logger.debug(f"Checking completion for quest '{quest.title}' (ID: {quest.id}): current_count={progress.current_count}, target_count={quest.target_count}")
        if progress.current_count >= quest.target_count and not quest.is_completed:
            # Mark quest as completed to prevent further progress updates
            quest.is_completed = True
            quest.save()
            logger.debug(f"Quest '{quest.title}' completed by user {user.username} (progress: {progress.current_count}/{quest.target_count})")   

            # Get all users who contributed to this quest (have progress > 0)
            contributing_progresses = QuestProgress.objects.filter(
                quest=quest, current_count__gt=0
            ).select_related("user")

            # Award rewards and create notifications for ALL contributors
            for contributor_progress in contributing_progresses:
                contributor = contributor_progress.user

                # Create completion record if it doesn't exist
                completion, completion_created = QuestCompletion.objects.get_or_create(
                    quest=quest,
                    user=contributor,
                    defaults={
                        "reading_group": (
                            obj_reading_group
                            if quest.participation_type == "group"
                            else None
                        )
                    },
                )

                # Award the reward if one is configured and not already awarded
                if quest.reward_template:
                    # Check if reward was already given to this user for this quest
                    if not UserReward.objects.filter(
                        user=contributor,
                        reward_template=quest.reward_template,
                        quest_completed=completion,
                    ).exists():
                        UserReward.objects.create(
                            user=contributor,
                            reward_template=quest.reward_template,
                            quest_completed=completion,
                        )

                        # Update user stats (atomic increment)
                        stats, _ = UserStats.objects.select_for_update().get_or_create(user=contributor)
                        stats.total_rewards_received = F('total_rewards_received') + 1
                        stats.save(update_fields=['total_rewards_received'])

                # Update quest completion stats (only if completion was just created)
                if completion_created:
                    stats, _ = UserStats.objects.select_for_update().get_or_create(user=contributor)
                    stats.total_quests_completed = F('total_quests_completed') + 1
                    stats.save(update_fields=['total_quests_completed'])

                # Create notification for quest completion (without using extra_text)
                Notification.objects.create(
                    directed_to=contributor,
                    related_to=contributor,
                    related_group=obj_reading_group,
                    related_quest=quest,
                    related_reward=quest.reward_template,
                    category="QuestCompleted",
                )


@receiver(post_save, sender=BookComment)
def track_comment_quests(sender, instance, created, **kwargs):
    """
    Track quest progress when a comment or reply is created.
    """
    if not created:
        return

    # Check if it's a reply or a root comment
    if instance.parent_comment:
        # It's a reply
        quest_type = "reply_comments"
        with transaction.atomic():
            stats, _ = UserStats.objects.select_for_update().get_or_create(user=instance.user)
            stats.total_replies_created = F('total_replies_created') + 1
            stats.save(update_fields=['total_replies_created'])
    else:
        # It's a root comment
        quest_type = "create_comments"

        # Update user stats for comments
        with transaction.atomic():
            stats, _ = UserStats.objects.select_for_update().get_or_create(user=instance.user)
            stats.total_comments_created = F('total_comments_created') + 1
            stats.save(update_fields=['total_comments_created'])

    # Update quest progress
    update_quest_progress(
        user=instance.user,
        quest_type=quest_type,
        obj_reading_group=instance.reading_group,
    )


@receiver(pre_save, sender=ReadingProgress)
def store_previous_completion_state(sender, instance, **kwargs):
    """
    Store the previous completion state before saving.
    """
    if instance.pk:
        try:
            old_instance = ReadingProgress.objects.get(pk=instance.pk)
            instance._was_completed = old_instance.is_completed
        except ReadingProgress.DoesNotExist:
            instance._was_completed = False
    else:
        instance._was_completed = False


@receiver(post_save, sender=ReadingProgress)
def track_reading_quests(sender, instance, created, **kwargs):
    """
    Track quest progress when a book is completed.
    Only triggers when is_completed changes from False to True.
    """
    # Check if book was just marked as completed (transition from False to True)
    was_completed = getattr(instance, "_was_completed", False)

    if instance.is_completed and not was_completed:
        # Update user stats (atomic increment)
        with transaction.atomic():
            stats, _ = UserStats.objects.select_for_update().get_or_create(user=instance.user)
            stats.total_books_read = F('total_books_read') + 1
            stats.save(update_fields=['total_books_read'])



        # Update for global quests (no group)
        # should be deleted, there is no global quests, only personal and group, 
        # cause the error for personal quests

        update_quest_progress(
            user=instance.user,
            quest_type="read_books",
            obj_reading_group=instance.book.reading_group,
            obj=instance.book,
        )


@receiver(post_save, sender=PrizeBoardCell)
def track_prize_placement_quests(sender, instance, created, **kwargs):
    """
    Track quest progress when a prize is placed on a board.
    """
    if not created:
        return

    # Update quest progress
    update_quest_progress(
        user=instance.placed_by,
        quest_type="place_rewards",
        obj_reading_group=instance.board.reading_group,
    )


@receiver(post_save, sender=UserReward)
def update_reward_summary_on_create(sender, instance, created, **kwargs):
    """Update reward summary when a new reward is created."""
    if created:
        update_reward_summary(instance.user, instance.reward_template)


@receiver(post_delete, sender=UserReward)
def update_reward_summary_on_delete(sender, instance, **kwargs):
    """Update reward summary when a reward is deleted."""
    update_reward_summary(instance.user, instance.reward_template)
