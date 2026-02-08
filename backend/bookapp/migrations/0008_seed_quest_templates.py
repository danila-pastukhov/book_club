from django.db import migrations


def seed_quest_templates(apps, schema_editor):
    QuestTemplate = apps.get_model("bookapp", "QuestTemplate")
    templates = [
        {
            "title": "Читательский марафон",
            "description": "Прочитайте книгу сегодня",
            "quest_type": "read_books",
            "target_count": 1,
        },
        {
            "title": "Активный читатель",
            "description": "Оставьте комментарии к книгам",
            "quest_type": "create_comments",
            "target_count": 3,
        },
        {
            "title": "Обсуждение",
            "description": "Ответьте на комментарии других читателей",
            "quest_type": "reply_comments",
            "target_count": 2,
        },
        {
            "title": "Щедрость",
            "description": "Разместите призы на доске",
            "quest_type": "place_rewards",
            "target_count": 1,
        },
        {
            "title": "Книжный червь",
            "description": "Прочитайте несколько книг",
            "quest_type": "read_books",
            "target_count": 2,
        },
        {
            "title": "Комментатор",
            "description": "Оставьте много комментариев",
            "quest_type": "create_comments",
            "target_count": 5,
        },
    ]
    for t in templates:
        QuestTemplate.objects.get_or_create(title=t["title"], defaults=t)


def reverse_seed(apps, schema_editor):
    QuestTemplate = apps.get_model("bookapp", "QuestTemplate")
    QuestTemplate.objects.filter(
        title__in=[
            "Читательский марафон",
            "Активный читатель",
            "Обсуждение",
            "Щедрость",
            "Книжный червь",
            "Комментатор",
        ]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("bookapp", "0007_questtemplate"),
    ]

    operations = [
        migrations.RunPython(seed_quest_templates, reverse_seed),
    ]
