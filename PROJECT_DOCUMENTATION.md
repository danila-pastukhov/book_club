# Book Club Platform - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Architecture](#database-architecture)
5. [API Reference](#api-reference)
6. [Authentication & Authorization](#authentication--authorization)
7. [Core Features](#core-features)
8. [Frontend Architecture](#frontend-architecture)
9. [Configuration & Deployment](#configuration--deployment)

---

## Project Overview

**Book Club** is a comprehensive social reading platform that enables users to publish, read, and discuss books collaboratively. The platform combines social features with gamification to create an engaging reading experience.

### Key Capabilities
- **Book Management**: Support for EPUB and plain text formats with full parsing and rendering
- **Social Reading**: Collaborative reading groups with shared discussions
- **Commenting System**: Location-aware comments with threaded replies and text highlighting
- **Gamification**: Quest system with rewards, achievements, and prize boards
- **Progress Tracking**: Automatic reading progress monitoring with CFI (Canonical Fragment Identifier) support

### Supported Formats
- **EPUB**: Full support with chapter navigation, TOC, and location tracking
- **Plain Text**: Basic text display with pagination

---

## Technology Stack

### Backend
- **Framework**: Django 5.1.2
- **API**: Django REST Framework 3.15.2
- **Authentication**: JWT (djangorestframework-simplejwt 5.3.1)
- **Database**: PostgreSQL (psycopg2/psycopg)
- **Storage**: MinIO/S3 (django-storages 1.14.4, boto3)
- **EPUB Processing**: EbookLib 0.18, BeautifulSoup4 4.12.3
- **Server**: Gunicorn (production)

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.1
- **Routing**: React Router DOM 6.28.0
- **State Management**: React Context API + TanStack React Query 5.60.5
- **HTTP Client**: Axios 1.7.7
- **UI Components**: Radix UI + Custom Components
- **Styling**: Tailwind CSS 3.4.14
- **Forms**: React Hook Form 7.53.2
- **EPUB Reader**: react-reader 2.0.6 + epubjs 0.3.93
- **Notifications**: React Toastify 10.0.6

---

## Project Structure

### Backend Structure (`/backend`)

```
backend/
├── book_api/                       # Django project configuration
│   ├── settings.py                # Main settings (DB, JWT, CORS, Storage)
│   ├── urls.py                    # Root URL routing
│   ├── asgi.py & wsgi.py         # Application servers
│   └── __init__.py
│
├── bookapp/                        # Main application
│   ├── models.py                  # 18 database models
│   ├── views.py                   # 70+ API endpoints
│   ├── serializers.py             # DRF serializers
│   ├── urls.py                    # App URL patterns
│   ├── admin.py                   # Django admin config
│   ├── signals.py                 # Quest auto-tracking signals
│   ├── validators.py              # EPUB validation
│   ├── epub_handler.py            # EPUB parsing utilities
│   ├── migrations/                # Database migrations
│   └── tests.py
│
├── manage.py                       # Django CLI
└── requirements.txt                # Python dependencies
```

### Frontend Structure (`/frontend/src`)

```
src/
├── api.js                          # Axios instance with JWT interceptor
├── App.jsx                         # Main router configuration
├── main.jsx                        # Entry point with providers
├── index.css                       # Tailwind + custom styles
│
├── components/ui/                  # Radix UI components (6 files)
│   ├── button.jsx
│   ├── input.jsx
│   ├── label.jsx
│   ├── select.jsx
│   ├── switch.jsx
│   └── textarea.jsx
│
├── context/                        # React Context
│   └── ThemeContext.jsx           # Dark/Light mode
│
├── hooks/                          # Custom React hooks (5 hooks)
│   ├── useBookComments.js         # Comment management
│   ├── useCommentReplies.js       # Reply management
│   ├── useHighlights.js           # EPUB highlighting
│   ├── useEpubReader.js           # EPUB reader state
│   └── useTextSelection.js        # Text selection capture
│
├── lib/                           # Utilities
│   └── utils.js                   # Tailwind class merger
│
├── pages/                         # 16 main pages (23 files)
│   ├── HomePage.jsx
│   ├── AllBooksPage.jsx
│   ├── DetailPage.jsx
│   ├── EpubReaderPage.jsx
│   ├── BookPagesPage.jsx
│   ├── ProfilePage.jsx
│   ├── ReadingGroupPage.jsx
│   ├── AllReadingGroupsPage.jsx
│   ├── QuestsPage.jsx
│   ├── GroupQuestsPage.jsx
│   ├── CreateQuestPage.jsx
│   ├── RewardsPage.jsx
│   ├── PrizeBoardPage.jsx
│   ├── CreatePostPage.jsx
│   ├── CreateReadingGroupPage.jsx
│   ├── NotificationsPage.jsx
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   └── NotFoundPage.jsx
│
├── services/                      # API service layer
│   └── apiBook.js                 # 70+ API endpoints
│
├── ui_components/                 # 35+ custom components
│   ├── AppLayout.jsx
│   ├── NavBar.jsx
│   ├── BookCard.jsx
│   ├── CommentCard.jsx
│   ├── CommentsSidebar.jsx
│   ├── QuestCard.jsx
│   ├── RewardCard.jsx
│   ├── PrizeBoard.jsx
│   └── ... (30+ more)
│
└── images/                        # Static assets
```

---

## Database Architecture

### Core Models

#### **CustomUser** (extends Django AbstractUser)
Extended user model with social profile fields.

**Fields**:
- Standard Django User fields (username, email, password, etc.)
- `bio`: TextField - User biography
- `profile_picture`: ImageField - Profile avatar
- `job_title`: CharField - Professional title
- Social links: `facebook`, `youtube`, `instagram`, `twitter`, `linkedin`

**Relationships**:
- One-to-One: `UserStats`
- Many-to-Many: `ReadingGroup` (through `UserToReadingGroupState`)
- One-to-Many: `Book` (authored books), `BookComment`, `UserReward`, `ReadingProgress`

---

#### **Book**
Central model for book content and metadata.

**Fields**:
- `title`: CharField(200) - Book title
- `slug`: SlugField - URL-friendly identifier (auto-generated with Cyrillic transliteration)
- `description`: TextField - Book synopsis
- `content`: TextField - Plain text content (for non-EPUB books)
- `content_type`: CharField - "plaintext" or "epub"
- `category`: CharField - 8 categories (Science Fiction, Fantasy, Detective, Mystery, Horror, Romance, Adventure, Thriller)
- `visibility`: CharField - "public", "group", or "personal"
- `epub_file`: FileField - Uploaded EPUB file (optional)
- `table_of_contents`: JSONField - EPUB chapter structure
- `featured_image`: ImageField - Book cover
- `created_at`, `updated_at`: DateTimeField - Timestamps

**Relationships**:
- Foreign Key: `author` (CustomUser)
- Foreign Key: `reading_group` (ReadingGroup, optional)
- One-to-Many: `BookComment`, `ReadingProgress`

**Indexes**: `book`, `author`, `reading_group`, `visibility`, `content_type`

---

#### **ReadingGroup**
Social groups for collaborative reading.

**Fields**:
- `name`: CharField(100) - Group name
- `slug`: SlugField - URL identifier
- `description`: TextField - Group description
- `featured_image`: ImageField - Group avatar
- `created_at`, `updated_at`: DateTimeField

**Relationships**:
- Foreign Key: `creator` (CustomUser)
- Many-to-Many: `users` (through `UserToReadingGroupState`)
- One-to-Many: `Book`, `Quest`, `PrizeBoard`, `Notification`

---

#### **UserToReadingGroupState**
Through table managing group membership.

**Fields**:
- `user`: Foreign Key to CustomUser
- `reading_group`: Foreign Key to ReadingGroup
- `in_reading_group`: Boolean - True if confirmed member, False if pending

**Unique Constraint**: (user, reading_group)

---

#### **BookComment**
Comments on book content with location awareness.

**Fields**:
- `comment_text`: TextField - Comment content (cannot be empty)
- `book`: Foreign Key - Associated book
- `author`: Foreign Key - Comment author (CustomUser)
- `reading_group`: Foreign Key - Group context (nullable for personal comments)
- `parent_comment`: Foreign Key - Self-referencing for replies (nullable)
- `cfi_range`: CharField(500) - EPUB CFI location (nullable)
- `selected_text`: TextField - Quoted text passage (nullable)
- `highlight_color`: CharField(7) - Hex color for highlighting
- `created_at`, `updated_at`: DateTimeField

**Properties**:
- `replies_count`: Count of child comments
- `replies`: Reverse relation to child comments

**Indexes**: `book`, `author`, `reading_group`, `parent_comment`

---

#### **Notification**
User notification system.

**Fields**:
- `user`: Foreign Key - Recipient
- `notification_category`: CharField - GroupJoinRequest, GroupRequestDeclined, GroupRequestAccepted, QuestCompleted
- `title`: CharField(200)
- `message`: TextField
- `created_at`: DateTimeField
- References: `reading_group`, `requesting_user`, `quest`, `reward` (all optional)

---

### Gamification Models

#### **RewardTemplate**
Global reward definitions.

**Fields**:
- `reward_name`: CharField(100) - Unique name
- `description`: TextField
- `reward_image`: ImageField

**Relationships**:
- One-to-Many: `UserReward`, `Quest`

---

#### **UserReward**
Individual reward instances earned by users.

**Fields**:
- `user`: Foreign Key to CustomUser
- `reward_template`: Foreign Key to RewardTemplate
- `received_at`: DateTimeField
- `quest_completed`: Foreign Key to QuestCompletion (nullable)

**Index**: `user`, `reward_template`

---

#### **UserRewardSummary**
Aggregated reward counts per user.

**Fields**:
- `user`: Foreign Key to CustomUser
- `reward_template`: Foreign Key to RewardTemplate
- `count`: Integer - Number of times received
- `last_received_at`: DateTimeField

**Unique Constraint**: (user, reward_template)

---

#### **Quest**
Challenge/task system for engagement.

**Fields**:
- `quest_type`: CharField - read_books, create_comments, reply_comments, place_rewards
- `participation`: CharField - personal (individual) or group (collaborative)
- `period`: CharField - day, week, month
- `target_count`: Integer - Goal to reach
- `start_date`, `end_date`: DateField - Quest duration
- `is_active`: Boolean - Currently available
- `is_completed`: Boolean - Target reached (prevents further updates)
- `reading_group`: Foreign Key - Group context (nullable for global/personal quests)
- `reward`: Foreign Key to RewardTemplate

**Relationships**:
- One-to-Many: `QuestProgress`, `QuestCompletion`

---

#### **QuestProgress**
Tracks individual user progress on quests.

**Fields**:
- `quest`: Foreign Key to Quest
- `user`: Foreign Key to CustomUser
- `current_count`: Integer - Progress toward target
- `updated_at`: DateTimeField

**Unique Constraint**: (quest, user)

---

#### **QuestCompletion**
Records when quests are completed.

**Fields**:
- `quest`: Foreign Key to Quest
- `user`: Foreign Key to CustomUser (for personal quests)
- `reading_group`: Foreign Key to ReadingGroup (for group quests)
- `completed_at`: DateTimeField

---

#### **PrizeBoard**
Grid-based visual display of rewards.

**Fields**:
- `reading_group`: OneToOne - Associated group
- `width`: Integer - Board columns (default 5)
- `height`: Integer - Board rows (default 5)
- `created_at`, `updated_at`: DateTimeField

**Relationships**:
- One-to-Many: `PrizeBoardCell`

---

#### **PrizeBoardCell**
Individual cells on the prize board.

**Fields**:
- `board`: Foreign Key to PrizeBoard
- `x`, `y`: Integer - Grid coordinates
- `reward`: Foreign Key to UserReward - Placed reward
- `placed_by`: Foreign Key to CustomUser - User who placed it
- `placed_at`: DateTimeField

**Unique Constraint**: (board, x, y)

---

### Progress Tracking Models

#### **ReadingProgress**
Tracks user's position in books.

**Fields**:
- `user`: Foreign Key to CustomUser
- `book`: Foreign Key to Book
- `current_page`: Integer - Page number (for plaintext)
- `total_pages`: Integer - Total pages
- `progress_percent`: Integer (0-100) - Calculated percentage
- `current_cfi`: CharField(500) - EPUB CFI position (nullable)
- `is_completed`: Boolean - Auto-set at 95%+
- `last_read_at`: DateTimeField

**Unique Constraint**: (user, book)

---

#### **UserStats**
Aggregated user statistics.

**Fields**:
- `user`: OneToOne to CustomUser
- `total_quests_completed`: Integer (default 0)
- `total_books_read`: Integer (default 0)
- `total_comments_created`: Integer (default 0)
- `total_replies_created`: Integer (default 0)
- `total_rewards_received`: Integer (default 0)

**Auto-updated via signals**

---

### Database Relationships Diagram

```
CustomUser ─┬─ 1:1 ──── UserStats
            ├─ 1:M ──── Book (author)
            ├─ 1:M ──── BookComment (author)
            ├─ 1:M ──── UserReward
            ├─ 1:M ──── ReadingProgress
            ├─ 1:M ──── QuestProgress
            └─ M:M ──── ReadingGroup (through UserToReadingGroupState)

ReadingGroup ─┬─ 1:M ──── Book
              ├─ 1:M ──── Quest
              ├─ 1:1 ──── PrizeBoard
              └─ M:M ──── CustomUser

Book ─┬─ 1:M ──── BookComment
      └─ 1:M ──── ReadingProgress

BookComment ─── 1:M ──── BookComment (replies)

Quest ─┬─ 1:M ──── QuestProgress
       └─ 1:M ──── QuestCompletion

PrizeBoard ─── 1:M ──── PrizeBoardCell

RewardTemplate ─┬─ 1:M ──── UserReward
                └─ 1:M ──── Quest
```

---

## API Reference

### Base Configuration
- **Base URL**: Configured via environment variables
- **Authentication**: JWT Bearer token in Authorization header
- **Content Type**: application/json
- **CORS**: Enabled for development origins

### Authentication Endpoints

#### Obtain Token
```
POST /token/
```
**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
**Response**:
```json
{
  "access": "jwt_token",
  "refresh": "refresh_token"
}
```

#### Refresh Token
```
POST /token_refresh/
```
**Request Body**:
```json
{
  "refresh": "refresh_token"
}
```
**Response**:
```json
{
  "access": "new_jwt_token"
}
```

---

### User Management

#### Register User
```
POST /register_user/
```
**Request Body**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "bio": "string (optional)",
  "job_title": "string (optional)"
}
```

#### Get Current Username
```
GET /get_username
Auth: Required
```

#### Get User Info
```
GET /get_userinfo/<username>
```
**Response**: User profile with books, groups, and statistics

#### Update User Profile
```
PUT /update_user/
Auth: Required
```
**Request Body**: Form data with profile fields

#### Get User by Email
```
GET /get_user/<email>
```

#### Get User's Books
```
GET /users/<username>/books/
```

#### Get User Statistics
```
GET /users/<username>/stats/
```
**Response**:
```json
{
  "total_quests_completed": 0,
  "total_books_read": 0,
  "total_comments_created": 0,
  "total_replies_created": 0,
  "total_rewards_received": 0
}
```

---

### Book Management

#### Create Book
```
POST /create_book/
Auth: Required
Content-Type: multipart/form-data
```
**Request Body**:
```
title: string
description: string
category: string (one of 8 categories)
content_type: "plaintext" | "epub"
visibility: "public" | "group" | "personal"
content: string (for plaintext books)
epub_file: File (for EPUB books)
reading_group: integer (optional, for group books)
featured_image: File (optional)
```

#### Get Book List
```
GET /book_list/<amount>/
Auth: Optional (affects visibility filtering)
```
**Query Params**:
- `offset`: Integer (pagination)
- `amount`: Integer (page size)

**Response**: Paginated list of books with visibility filtering

#### Get Public Books Only
```
GET /public_books/<amount>/
```

#### Get Single Book
```
GET /books/<slug>
```
**Response**:
```json
{
  "id": 1,
  "title": "Book Title",
  "slug": "book-title",
  "description": "...",
  "content": "...",
  "content_type": "epub",
  "category": "Science Fiction",
  "visibility": "public",
  "table_of_contents": [],
  "featured_image": "url",
  "author": {
    "username": "...",
    "profile_picture": "url"
  },
  "reading_group": null,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Update Book
```
PUT /update_book/<id>/
Auth: Required (must be author)
```

#### Delete Book
```
DELETE /delete_book/<id>/
Auth: Required (must be author)
```

#### Get Book Chapters (EPUB)
```
GET /books/<slug>/chapters/
```
**Response**: List of chapter IDs and titles

#### Get Specific Chapter (EPUB)
```
GET /books/<slug>/chapters/<chapter_id>/
```
**Response**:
```json
{
  "id": "chapter1",
  "title": "Chapter 1",
  "content": "HTML content",
  "text": "Plain text content"
}
```

---

### Reading Groups

#### Create Group
```
POST /create_group/
Auth: Required
Content-Type: multipart/form-data
```
**Request Body**:
```
name: string
description: string
featured_image: File (optional)
```

#### Get Group List
```
GET /group_list/<amount>/
```
**Query Params**: `offset`, `amount`

#### Get Single Group
```
GET /groups/<slug>
```
**Response**:
```json
{
  "id": 1,
  "name": "Group Name",
  "slug": "group-name",
  "description": "...",
  "featured_image": "url",
  "creator": {...},
  "users": [
    {
      "id": 1,
      "username": "user1",
      "in_reading_group": true
    }
  ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Update Group
```
PUT /update_group/<id>/
Auth: Required (must be creator)
```

#### Delete Group
```
DELETE /delete_group/<id>/
Auth: Required (must be creator)
```

#### Get User's Member Groups
```
GET /user_reading_groups/
Auth: Required
```
**Response**: Groups where user is confirmed member

#### Get User's Created Groups
```
GET /user_created_groups/
Auth: Required
```

#### Join Group (Request Membership)
```
PUT /group/<id>/add_user/
Auth: Required
```
**Action**: Creates pending membership (in_reading_group=False)

#### Leave Group
```
PUT /group/<id>/remove_user/
Auth: Required
```

#### Confirm Member
```
PUT /group/<id>/confirm_user/<user_id>/
Auth: Required (must be group creator)
```
**Action**: Sets in_reading_group=True

#### Get Group's Reading Books
```
GET /groups/<slug>/books/reading/
Auth: Required
```
**Response**: Books with comments in this group

#### Get Group's Posted Books
```
GET /groups/<slug>/books/posted/
Auth: Required
```
**Response**: Books created by group creator with group visibility

---

### Book Comments

#### Get Root Comments
```
GET /books/<slug>/comments/
Auth: Required
```
**Query Params**:
- `reading_group_id`: Integer (optional, for group comments)

**Response**: List of root comments (excluding replies) with group/personal filtering

#### Create Comment
```
POST /books/<slug>/comments/create/
Auth: Required
```
**Request Body**:
```json
{
  "comment_text": "string",
  "reading_group_id": 1 (optional),
  "cfi_range": "epubcfi(...)" (optional),
  "selected_text": "quoted text" (optional),
  "highlight_color": "#FFFF00" (optional)
}
```
**Validation**: Checks group membership if reading_group_id provided

#### Get Single Comment
```
GET /books/<slug>/comments/<comment_id>/
Auth: Required
```

#### Update Comment
```
PUT /books/<slug>/comments/<comment_id>/update/
Auth: Required (must be comment author)
```
**Request Body**:
```json
{
  "comment_text": "updated text"
}
```

#### Delete Comment
```
DELETE /books/<slug>/comments/<comment_id>/delete/
Auth: Required (must be author or group creator)
```

---

### Comment Replies

#### Get Replies
```
GET /books/<slug>/comments/<comment_id>/replies/
Auth: Required
```
**Response**: List of reply comments

#### Create Reply
```
POST /books/<slug>/comments/<comment_id>/replies/create/
Auth: Required
```
**Request Body**:
```json
{
  "comment_text": "reply text",
  "reading_group_id": 1 (optional, inherited from parent)
}
```

#### Update Reply
```
PUT /books/<slug>/comments/<comment_id>/replies/<reply_id>/update/
Auth: Required (must be reply author)
```

#### Delete Reply
```
DELETE /books/<slug>/comments/<comment_id>/replies/<reply_id>/delete/
Auth: Required (must be author or group creator)
```

---

### Notifications

#### Get Notifications
```
GET /notifications/<amount>/
Auth: Required
```
**Query Params**: `offset`, `amount`

#### Get Single Notification
```
GET /get_notification/<id>/
Auth: Required
```

#### Create Notification
```
POST /create_notification/
Auth: Required
```
**Request Body**:
```json
{
  "notification_category": "GroupJoinRequest" | "GroupRequestDeclined" | "GroupRequestAccepted" | "QuestCompleted",
  "title": "string",
  "message": "string",
  "reading_group": 1 (optional),
  "requesting_user": 1 (optional),
  "quest": 1 (optional),
  "reward": 1 (optional)
}
```

#### Delete Notification
```
DELETE /delete_notification/<id>/
Auth: Required (must be recipient)
```

---

### Gamification - Quests

#### Get Active Quests
```
GET /quests/
Auth: Required
```
**Response**: Global quests + user's group quests (active only)

#### Get User's Quests with Progress
```
GET /quests/my/
Auth: Required
```
**Response**: Quests with current_count and completion status

#### Create Quest
```
POST /quests/create/
Auth: Required (must be admin or group creator)
```
**Request Body**:
```json
{
  "quest_type": "read_books" | "create_comments" | "reply_comments" | "place_rewards",
  "participation": "personal" | "group",
  "period": "day" | "week" | "month",
  "target_count": 10,
  "start_date": "2024-01-01",
  "end_date": "2024-01-07",
  "reading_group": 1 (optional),
  "reward": 1
}
```

#### Get Quest Progress
```
GET /quests/<id>/progress/
Auth: Required
```
**Response**:
```json
{
  "current_count": 5,
  "target_count": 10,
  "is_completed": false
}
```

#### Get Group Quests with Progress
```
POST /groups/<slug>/quests/
Auth: Required
```
**Response**: Group quests with aggregated progress

#### Generate Daily Group Quests
```
POST /groups/<slug>/quests/generate/
Auth: Required (must be group creator)
```
**Action**: Creates 3 random daily quests for the group

#### Generate Personal Daily Quests
```
POST /quests/daily/personal/
Auth: Required
```
**Action**: Creates 3 random personal daily quests

---

### Gamification - Rewards

#### Get Reward Templates
```
GET /rewards/templates/
Auth: Required
```
**Response**: List of available reward templates

#### Create Reward Template
```
POST /rewards/templates/create/
Auth: Required (admin or group leader)
Content-Type: multipart/form-data
```
**Request Body**:
```
reward_name: string
description: string
reward_image: File
```

#### Get Current User's Rewards
```
GET /rewards/my/
Auth: Required
```
**Response**: List of UserReward instances

#### Get User's Reward Summary
```
GET /rewards/my/summary/
Auth: Required
```
**Response**: Aggregated counts by reward template
```json
[
  {
    "reward_template": {...},
    "count": 5,
    "last_received_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Get Placed Reward IDs
```
GET /rewards/my/placements/
Auth: Required
```
**Response**: List of reward IDs already placed on boards

#### Get User's Rewards (Public)
```
GET /rewards/user/<username>/
```

#### Get User's Reward Summary (Public)
```
GET /rewards/user/<username>/summary/
```

---

### Gamification - Prize Board

#### Get Prize Board
```
GET /groups/<slug>/board/
Auth: Required
```
**Response**:
```json
{
  "id": 1,
  "reading_group": 1,
  "width": 5,
  "height": 5,
  "cells": [
    {
      "x": 0,
      "y": 0,
      "reward": {...},
      "placed_by": {...},
      "placed_at": "2024-01-01T00:00:00Z"
    }
  ],
  "can_edit": true
}
```

#### Update Board Settings
```
PUT /groups/<slug>/board/settings/
Auth: Required (must be group creator)
```
**Request Body**:
```json
{
  "width": 10,
  "height": 10
}
```

#### Place Reward on Board
```
POST /groups/<slug>/board/place/
Auth: Required (must be group member)
```
**Request Body**:
```json
{
  "x": 2,
  "y": 3,
  "reward_id": 123
}
```
**Validation**: Checks reward ownership and availability

#### Remove Reward from Board
```
DELETE /groups/<slug>/board/remove/<x>/<y>/
Auth: Required (must be the user who placed it)
```

---

### Reading Progress

#### Get Reading Progress
```
GET /books/<slug>/progress/
Auth: Required
```
**Response**:
```json
{
  "current_page": 50,
  "total_pages": 200,
  "progress_percent": 25,
  "current_cfi": "epubcfi(...)",
  "is_completed": false,
  "last_read_at": "2024-01-01T00:00:00Z"
}
```

#### Update Reading Progress
```
PUT /books/<slug>/progress/update/
Auth: Required
```
**Request Body**:
```json
{
  "current_page": 75 (for plaintext),
  "total_pages": 200,
  "current_cfi": "epubcfi(...)" (for EPUB)
}
```
**Action**: Auto-completes at 95%+, triggers quest progress

#### Mark Book as Complete
```
POST /books/<slug>/complete/
Auth: Required
```
**Action**: Sets is_completed=True, updates statistics

---

## Authentication & Authorization

### JWT Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ POST /token/ (username, password)
       ▼
┌─────────────┐
│   Backend   │──── Validate credentials
└──────┬──────┘
       │
       │ Returns { access, refresh }
       ▼
┌─────────────┐
│   Client    │──── Store in localStorage
└──────┬──────┘
       │
       │ All requests include: Authorization: Bearer <access_token>
       ▼
┌─────────────┐
│   Backend   │──── Verify JWT signature & expiry
└──────┬──────┘
       │
       ├─ Valid ──► Process request
       │
       └─ Expired ──► Return 401
                      │
                      ▼
                Client refreshes token via /token_refresh/
```

### Token Configuration
- **Access Token Lifetime**: 60 minutes
- **Algorithm**: HS256
- **Storage**: localStorage (frontend)
- **Header Format**: `Authorization: Bearer <token>`

### Frontend Token Management
1. **Automatic Refresh**: ProtectedRoute component checks token expiry and refreshes if needed
2. **Request Interceptor**: api.js adds Bearer token to all requests
3. **Logout**: Clears tokens from localStorage

---

### Permission Levels

#### Book Visibility Permissions
| Visibility | Create | View | Edit | Delete |
|-----------|--------|------|------|--------|
| Public | Any auth user | Anyone | Author | Author |
| Group | Group member | Group members | Author | Author |
| Personal | Any auth user | Author only | Author | Author |

#### Comment Permissions
| Action | Permission |
|--------|-----------|
| Create | Authenticated + Book access + Group membership (if group comment) |
| View | Authenticated + Book access + Same context (group/personal) |
| Edit | Comment author |
| Delete | Comment author OR Group creator |

#### Reading Group Permissions
| Action | Permission |
|--------|-----------|
| Create | Authenticated |
| View | Public |
| Join | Authenticated |
| Confirm Members | Group creator |
| Edit | Group creator |
| Delete | Group creator |

#### Quest Permissions
| Action | Permission |
|--------|-----------|
| View | Authenticated |
| Create Global | Admin |
| Create Group | Group creator |
| Track Progress | Automatic (signals) |

#### Prize Board Permissions
| Action | Permission |
|--------|-----------|
| View | Group member |
| Place Reward | Group member (owns reward) |
| Remove Reward | User who placed it |
| Edit Settings | Group creator |

---

## Core Features

### 1. EPUB Book Processing

#### File Upload & Validation
**Workflow**: Upload → Validate → Parse → Store

**Validation Chain** (validators.py):
1. **Extension Check**: Must be `.epub`
2. **Size Limit**: Maximum 50MB
3. **Structure Validation**:
   - Valid ZIP archive
   - Contains `mimetype` file (first entry)
   - Contains `META-INF/container.xml`
   - ZIP integrity verified
4. **Security Checks**:
   - Path traversal detection (`..`, absolute paths)
   - Executable file detection (.exe, .dll, .sh, etc.)
   - Zip bomb protection (max 1000 files, 100:1 compression ratio)

#### EPUB Parsing (epub_handler.py)

**EPUBHandler Class** provides:

**Metadata Extraction**:
```python
{
  "title": "Book Title",
  "author": "Author Name",
  "language": "en",
  "description": "...",
  "publisher": "..."
}
```

**Chapter Extraction**:
```python
[
  {
    "id": "chapter1.xhtml",
    "title": "Chapter 1",
    "content": "<html>...</html>",
    "text": "Plain text..."
  }
]
```

**Table of Contents**:
```python
[
  {
    "title": "Part I",
    "children": [
      {"title": "Chapter 1", "href": "chapter1.xhtml"},
      {"title": "Chapter 2", "href": "chapter2.xhtml"}
    ]
  }
]
```

**Storage**: EPUBs stored in MinIO/S3, metadata and TOC in PostgreSQL

---

### 2. Comment System with Highlighting

#### Architecture

```
Comment Types:
├── Personal Comments
│   └── Visible only to author
└── Group Comments
    └── Visible to all confirmed group members

Comment Structure:
├── Root Comments (parent_comment=null)
│   ├── Associated with book + location
│   └── Can have replies
└── Reply Comments (parent_comment=id)
    └── Threaded responses
```

#### Location Tracking (EPUB)

**CFI (Canonical Fragment Identifier)**:
- Standard EPUB location format
- Example: `epubcfi(/6/4[chap01ref]!/4/2/16[para05]/1:0)`
- Stored in `BookComment.cfi_range`

**Frontend Implementation**:
1. **Text Selection** (useTextSelection.js):
   - Detects user text selection in EPUB iframe
   - Captures CFI range via epubjs API
   - Extracts selected text
   - Displays floating comment button

2. **Highlighting** (useHighlights.js):
   - Filters comments by current spine item
   - Applies highlights using rendition.annotations
   - Supports custom colors per comment
   - Retry logic for DOM stability (3 attempts)
   - Auto-applies on page navigation

#### Comment Workflow

```
┌──────────────┐
│ User selects │
│    text      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ CFI + text   │
│  captured    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Comment form │
│   appears    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Submit with: │
│ - text       │
│ - cfi_range  │
│ - selected   │
│ - color      │
│ - group_id   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Backend:     │
│ - Validate   │
│ - Save       │
│ - Signal     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Frontend:    │
│ - Refresh    │
│ - Highlight  │
│ - Display    │
└──────────────┘
```

---

### 3. Gamification System

#### Quest Types

| Quest Type | Tracks | Trigger |
|-----------|--------|---------|
| read_books | Completed books | ReadingProgress completion signal |
| create_comments | Root comments created | BookComment creation signal |
| reply_comments | Reply comments created | BookComment creation signal (with parent) |
| place_rewards | Rewards placed on board | PrizeBoardCell creation signal |

#### Quest Lifecycle

```
┌──────────────┐
│ Quest Active │ (is_active=True)
└──────┬───────┘
       │
       │ User performs action (read, comment, etc.)
       ▼
┌──────────────┐
│ Signal fires │ (post_save)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ QuestProgress│ current_count++
│   updated    │
└──────┬───────┘
       │
       │ If current_count >= target_count
       ▼
┌──────────────┐
│ Quest marked │ is_completed=True
│  completed   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│QuestCompletion│ Created for user/group
│   created    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ UserReward   │ Awarded to participants
│   created    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ UserStats    │ total_quests_completed++
│   updated    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Notification │ Created for user
│   created    │
└──────────────┘
```

#### Group Quest Special Handling
- **Progress Aggregation**: Sums all confirmed members' progress
- **Reward Distribution**: All contributing members receive reward
- **Completion**: Single QuestCompletion record per group

#### Daily Quest Generation
**Endpoint**: `POST /groups/<slug>/quests/generate/` or `POST /quests/daily/personal/`

**Algorithm**:
1. Select 3 random quest types
2. Create quests with:
   - Period: "day"
   - start_date: today
   - end_date: today
   - Random target counts (5-20)
3. Prevent duplicate quest types on same day

---

### 4. Prize Board System

#### Visual Representation

```
Group Prize Board (5x5 grid example):

┌─────┬─────┬─────┬─────┬─────┐
│ 🏆  │     │ 🥇  │     │     │
│User1│     │User2│     │     │
├─────┼─────┼─────┼─────┼─────┤
│     │ 🎖️  │     │     │ 🏅  │
│     │User3│     │     │User1│
├─────┼─────┼─────┼─────┼─────┤
│ 🥈  │     │     │ 🥉  │     │
│User2│     │     │User3│     │
├─────┼─────┼─────┼─────┼─────┤
│     │     │     │     │     │
│     │     │     │     │     │
├─────┼─────┼─────┼─────┼─────┤
│     │ 🏆  │     │     │     │
│     │User1│     │     │     │
└─────┴─────┴─────┴─────┴─────┘
```

#### Features
- **Grid-Based Layout**: Configurable width × height
- **Ownership Tracking**: Each cell stores placer
- **Visual Display**: Reward images shown in cells
- **Interactions**:
  - Zoom controls
  - Name display toggle
  - Place/remove rewards
- **Permissions**: Only placer can remove

#### Workflow
1. User completes quest → Receives UserReward
2. Navigate to group prize board
3. Select owned, unplaced reward
4. Click empty cell to place
5. Reward displayed with user attribution
6. Can remove own placements

---

### 5. Reading Progress Tracking

#### Progress Calculation

**For Plain Text Books**:
```python
progress_percent = (current_page / total_pages) * 100
```

**For EPUB Books**:
- Store CFI (Canonical Fragment Identifier) position
- Percentage calculated by epubjs on frontend
- Synced to backend on navigation

#### Auto-Completion
**Trigger**: `progress_percent >= 95`
**Actions**:
1. Set `ReadingProgress.is_completed = True`
2. Update `UserStats.total_books_read += 1`
3. Trigger quest progress for "read_books" quests
4. Award quest rewards if target reached

#### Synchronization
**Frontend** (EpubReaderPage):
- Tracks current location via epubjs
- Calls `updateReadingProgress()` API on:
  - Page turn
  - Chapter navigation
  - Window close/navigate away

**Backend** (ReadingProgress model):
- Auto-updates `last_read_at` on save
- Validates CFI format for EPUB
- Enforces unique constraint (user, book)

---

## Frontend Architecture

### State Management Strategy

**React Query** for server state:
- Automatic caching with configurable stale time
- Query invalidation on mutations
- Loading/error state management
- Background refetching

**Context API** for global client state:
- Theme (dark/light mode)
- No Redux/Zustand needed for this scale

**Local State** (useState) for:
- Form inputs
- UI toggles
- Component-specific state

### Custom Hooks Pattern

**5 Specialized Hooks**:

1. **useBookComments** - Comment CRUD + filtering
   ```javascript
   const {
     comments,
     isLoading,
     createComment,
     updateComment,
     deleteComment,
     selectedGroup,
     handleGroupChange
   } = useBookComments(bookSlug);
   ```

2. **useCommentReplies** - Reply management
   ```javascript
   const {
     replies,
     createReply,
     updateReply,
     deleteReply
   } = useCommentReplies(bookSlug, commentId);
   ```

3. **useEpubReader** - Reader state
   ```javascript
   const {
     location,
     toc,
     fontSize,
     showToc,
     onLocationChanged,
     handleChapterClick,
     increaseFontSize,
     decreaseFontSize
   } = useEpubReader(bookData);
   ```

4. **useHighlights** - EPUB highlighting
   ```javascript
   const { applyHighlights } = useHighlights(
     rendition,
     comments,
     currentSpine
   );
   ```

5. **useTextSelection** - Selection capture
   ```javascript
   const {
     selectedText,
     cfiRange,
     buttonPosition,
     clearSelection
   } = useTextSelection(rendition);
   ```

### Component Architecture

**Design System**:
- Base components (Radix UI) in `/components/ui`
- Custom composite components in `/ui_components`
- Page components in `/pages`

**Composition Example**:
```
EpubReaderPage
├── useEpubReader (state)
├── ReactReader (epub rendering)
│   └── useHighlights (visual highlights)
├── CommentsSidebar
│   ├── useBookComments (data)
│   ├── GroupSelector (filter)
│   └── CommentCard[]
│       └── CommentReplies
│           └── useCommentReplies (data)
└── CommentButton (on selection)
    └── CommentForm
```

### Routing Configuration

**React Router v6** setup:
```javascript
<Routes>
  <Route element={<AppLayout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/books" element={<AllBooksPage />} />
    <Route path="/books/:slug" element={<DetailPage />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/books/:slug/page" element={<EpubReaderPage />} />
      <Route path="/groups/:slug" element={<ReadingGroupPage />} />
      <Route path="/quests" element={<QuestsPage />} />
      {/* ... more protected routes */}
    </Route>
  </Route>
</Routes>
```

**ProtectedRoute Component**:
- Checks JWT token existence
- Validates token expiry
- Auto-refreshes if expired
- Redirects to /signin if invalid

---

## Configuration & Deployment

### Backend Configuration

#### Environment Variables (via python-decouple)
```env
# Database
DB_NAME=bookclub_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# MinIO/S3 Storage
AWS_ACCESS_KEY_ID=minio_access_key
AWS_SECRET_ACCESS_KEY=minio_secret_key
AWS_STORAGE_BUCKET_NAME=bookclub
AWS_S3_ENDPOINT_URL=http://localhost:9000
AWS_S3_REGION_NAME=us-east-1

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### settings.py Key Settings
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        # ... other DB config
    }
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
}

DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

DATA_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50MB
```

#### Production Checklist
- [ ] Set `DEBUG=False`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Use environment-based `SECRET_KEY`
- [ ] Configure production database
- [ ] Set up MinIO/S3 bucket with proper ACLs
- [ ] Configure HTTPS for API
- [ ] Set up Gunicorn with proper workers
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up CORS for production frontend domain

---

### Frontend Configuration

#### Environment Variables (.env)
```env
VITE_BASE_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000
```

#### Vite Configuration (vite.config.js)
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
```

#### Build Configuration
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

#### Production Build
```bash
npm run build
```
**Output**: `/dist` directory with optimized static files

#### Deployment Options
1. **Static Hosting**: Vercel, Netlify, AWS S3 + CloudFront
2. **Self-Hosted**: Nginx serving built files
3. **Docker**: Multi-stage build with nginx

**Nginx Example**:
```nginx
server {
    listen 80;
    server_name bookclub.example.com;

    root /var/www/bookclub/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
    }
}
```

---

### Database Setup

#### PostgreSQL Installation
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE bookclub_db;
CREATE USER bookclub_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE bookclub_db TO bookclub_user;
```

#### Migrations
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

---

### MinIO Storage Setup

#### Docker Compose Example
```yaml
version: '3'
services:
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minio_admin
      MINIO_ROOT_PASSWORD: minio_password
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  minio_data:
```

#### Bucket Setup
1. Access MinIO console: http://localhost:9001
2. Create bucket: `bookclub`
3. Set access policy: Public read for media
4. Configure CORS if needed

---

### Development Setup

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Full Stack
1. Start PostgreSQL
2. Start MinIO (optional, can use filesystem)
3. Start Django backend (port 8000)
4. Start React frontend (port 5173)
5. Access: http://localhost:5173

---

## API Testing Examples

### Using curl

**Register User**:
```bash
curl -X POST http://localhost:8000/register_user/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'
```

**Login**:
```bash
curl -X POST http://localhost:8000/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

**Get Books (Authenticated)**:
```bash
curl -X GET http://localhost:8000/book_list/10/?offset=0 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Create Comment**:
```bash
curl -X POST http://localhost:8000/books/book-slug/comments/create/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comment_text": "Great book!",
    "cfi_range": "epubcfi(/6/4!/4/2/16/1:0)",
    "selected_text": "Selected passage",
    "highlight_color": "#FFFF00"
  }'
```

---

## Troubleshooting

### Common Issues

#### EPUB Upload Fails
**Symptoms**: 400 error, "Invalid EPUB file"
**Solutions**:
- Check file size (max 50MB)
- Verify file is valid ZIP
- Ensure mimetype file exists
- Check for path traversal attempts

#### Comments Not Appearing
**Symptoms**: Comments created but not visible
**Solutions**:
- Verify reading_group_id matches current group
- Check group membership status
- Ensure user is confirmed member (in_reading_group=True)

#### Highlights Not Displaying
**Symptoms**: Comments exist but no visual highlights
**Solutions**:
- Check CFI range validity
- Verify current spine item matches comment location
- Check browser console for errors
- Ensure epubjs rendition is ready

#### Token Expired Errors
**Symptoms**: 401 Unauthorized on API calls
**Solutions**:
- Check access token expiry (jwt-decode)
- Call /token_refresh/ with refresh token
- Ensure ProtectedRoute is wrapping route
- Clear localStorage and re-login

#### Quest Progress Not Updating
**Symptoms**: Actions performed but progress stays 0
**Solutions**:
- Check quest is_active=True
- Verify signal is firing (check logs)
- Ensure group membership for group quests
- Check quest period dates (start_date <= today <= end_date)

---

## Performance Considerations

### Backend Optimization
1. **Database Indexes**: Key fields indexed (see models)
2. **Query Optimization**: Use select_related/prefetch_related in serializers
3. **Pagination**: All list endpoints support offset/limit
4. **Caching**: Consider Redis for session/query caching
5. **S3 Storage**: Offloads media serving from Django

### Frontend Optimization
1. **React Query Caching**: Reduces API calls
2. **Code Splitting**: Vite handles automatically
3. **Image Optimization**: Use WebP format for featured images
4. **Lazy Loading**: Components loaded on demand
5. **Debouncing**: Search inputs debounced

---

## Security Considerations

### Backend Security
1. **JWT Tokens**: Short-lived (60min) access tokens
2. **CSRF Protection**: Enabled for cookie-based auth
3. **CORS**: Whitelist specific origins
4. **File Validation**: Comprehensive EPUB checks
5. **SQL Injection**: ORM prevents by default
6. **XSS**: DRF serializers escape output

### Frontend Security
1. **Token Storage**: localStorage (consider httpOnly cookies for production)
2. **HTTPS**: Required for production
3. **Input Sanitization**: React escapes by default
4. **CSRF Tokens**: Axios handles automatically

---

## Future Enhancements

### Potential Features
1. **BookReview Model**: Currently defined but no API endpoints
2. **Real-time Notifications**: WebSocket support
3. **Advanced Search**: Full-text search with filters
4. **Social Features**: Follow users, activity feeds
5. **Mobile App**: React Native version
6. **Analytics Dashboard**: Reading statistics, trends
7. **Export Features**: Download progress reports, annotations
8. **Collaborative Editing**: Shared book editing

### Technical Improvements
1. **Caching Layer**: Redis for sessions and queries
2. **Background Tasks**: Celery for async processing
3. **CDN Integration**: CloudFront/Cloudflare for media
4. **Monitoring**: Sentry error tracking, New Relic APM
5. **CI/CD**: GitHub Actions for automated testing/deployment
6. **Testing**: Comprehensive unit/integration tests
7. **Documentation**: API documentation with Swagger/OpenAPI

---

## Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Make changes with tests
4. Run linters (ESLint, Pylint)
5. Submit pull request

### Code Standards
- **Python**: PEP 8 style guide
- **JavaScript**: ESLint with React plugin
- **Commits**: Conventional commit messages
- **Documentation**: Update docs with changes

---

## License & Contact

*Document generated on 2026-02-03*
*For questions or support, refer to project maintainers*
