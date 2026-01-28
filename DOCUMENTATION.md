# Book Club Platform - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Backend Structure](#backend-structure)
5. [Frontend Structure](#frontend-structure)
6. [Database Models](#database-models)
7. [API Documentation](#api-documentation)
8. [Authentication & Authorization](#authentication--authorization)
9. [Key Features](#key-features)
10. [Setup & Installation](#setup--installation)

---

## Project Overview

A full-stack social book club platform that enables users to:
- Publish and share books/posts
- Create and join reading groups
- Manage group memberships with approval workflows
- Receive notifications for group activities
- Build user profiles with social media links

**Live Application**: Supports both local development and production deployment with PostgreSQL backend.

---

## Technology Stack

### Backend
- **Framework**: Django 5.1.2
- **API**: Django REST Framework 3.15.2
- **Database**: PostgreSQL 13+ (psycopg2/psycopg)
- **Authentication**: JWT (djangorestframework-simplejwt 5.3.1)
- **Image Processing**: Pillow
- **Server**: Gunicorn (production)
- **CORS**: django-cors-headers
- **Configuration**: python-decouple

### Frontend
- **Framework**: React 18.3.1
- **Routing**: React Router 6.28.0
- **Build Tool**: Vite 5.4.1
- **State Management**: TanStack React Query 5.60.5
- **HTTP Client**: Axios 1.7.7
- **Form Handling**: React Hook Form 7.53.2
- **Styling**: Tailwind CSS 3.4.14
- **UI Components**: Radix UI
- **Icons**: lucide-react, react-icons
- **Notifications**: React Toastify 10.0.6
- **JWT Handling**: jwt-decode

---

## Project Architecture

### Directory Structure

```
book_club/
├── backend/                          # Django Backend
│   ├── book_api/                     # Main Django project
│   │   ├── settings.py               # Configuration
│   │   ├── urls.py                   # Root URL routing
│   │   ├── wsgi.py                   # WSGI server
│   │   └── asgi.py                   # ASGI server
│   ├── bookapp/                      # Main application
│   │   ├── models.py                 # Database models
│   │   ├── views.py                  # API views
│   │   ├── serializers.py            # DRF serializers
│   │   ├── urls.py                   # App URL routing
│   │   ├── admin.py                  # Admin configuration
│   │   ├── needed_functions.py       # Helper functions
│   │   └── migrations/               # Database migrations
│   ├── media/                        # User-uploaded files
│   ├── manage.py                     # Django CLI
│   └── requirements.txt              # Python dependencies
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── App.jsx                   # Main routing & auth
│   │   ├── main.jsx                  # React entry point
│   │   ├── api.js                    # Axios configuration
│   │   ├── pages/                    # Page components (11 pages)
│   │   ├── ui_components/            # Reusable components (25+)
│   │   ├── components/ui/            # Radix UI wrappers
│   │   ├── services/                 # API service layer
│   │   └── lib/                      # Utilities
│   ├── public/                       # Static assets
│   ├── package.json                  # NPM dependencies
│   └── vite.config.js                # Vite configuration
│
└── README.md                         # Project README
```

---

## Backend Structure

### Django Apps

#### **book_api** (Main Project)
- Project-level configuration
- Root URL routing
- WSGI/ASGI application setup
- JWT token endpoint configuration

#### **bookapp** (Main Application)
Contains all business logic:
- **Models**: CustomUser, Book, ReadingGroup, UserToReadingGroupState, Notification
- **Views**: 28+ API endpoint views using DRF APIView
- **Serializers**: Model serializers with custom validation
- **URLs**: Application-level routing

### Configuration Highlights

**settings.py**:
- Custom user model: `AUTH_USER_MODEL = "bookapp.CustomUser"`
- JWT access token lifetime: 60 minutes
- PostgreSQL connection (remote server: DB_HOST:DB_PORT)
- CORS origins: localhost:5173-5175 (for test)
- Media URL: `/img/`, Media root: `media/`
- Logging: File (app.log) and console

**Middleware Stack**:
1. SecurityMiddleware
2. SessionMiddleware
3. CORSMiddleware (early placement)
4. CommonMiddleware
5. CsrfViewMiddleware
6. AuthenticationMiddleware
7. MessageMiddleware
8. XFrameOptionsMiddleware

---

## Frontend Structure

### Pages (11 Total)

| Page | Route | Protected | Purpose |
|------|-------|-----------|---------|
| HomePage | `/` | No | Landing page with 3 books |
| AllBooksPage | `/books` | No | Paginated book list (9/page) |
| DetailPage | `/books/:slug` | No | Book detail with edit/delete |
| BookPagesPage | `/books/:slug/page` | No | Book reading view |
| AllReadingGroupsPage | `/groups` | No | Paginated groups (9/page) |
| ReadingGroupPage | `/groups/:slug` | No | Group detail with members |
| CreatePostPage | `/create_book` | Yes | Create/edit books |
| CreateReadingGroupPage | `/create_group` | Yes | Create/edit groups |
| LoginPage | `/signin` | No | User login |
| SignupPage | `/signup` | No | User registration |
| ProfilePage | `/profile/:username` | No | User profile with books |
| NotificationsPage | `/notifications` | No | User notifications |

### UI Components Organization

**Layout Components**:
- `AppLayout.jsx` - Main wrapper with NavBar, dark mode, footer
- `NavBar.jsx` - Navigation with auth state
- `ResponsiveNavBar.jsx` - Mobile menu

**Container Components** (Grid layouts):
- `BookContainer.jsx` - Flexbox grid for books
- `ReadingGroupContainer.jsx` - Grid for groups
- `NotificationContainer.jsx` - Grid for notifications

**Card Components**:
- `BookCard.jsx` - Individual book display
- `ReadingGroupCard.jsx` - Individual group display
- `NotificationCard.jsx` - Single notification

**Form Components**:
- Book creation/editing form
- Reading group creation/editing form
- Login/signup forms
- Profile edit modal

**Utility Components**:
- `ProtectedRoute.jsx` - Auth wrapper with token refresh
- `Modal.jsx` - Backdrop modal
- `PagePagination.jsx` - Pagination controls
- `Spinner.jsx` - Loading indicators

### State Management

**React Query**:
- Server state caching
- Query keys: `['books', page]`, `['reading_groups', page]`, `['users', username]`
- Automatic refetching and cache invalidation
- `keepPreviousData` for smooth pagination

**Local State**:
- Authentication state (username, isAuthenticated) in App.jsx
- Page numbers for pagination
- Modal visibility toggles
- Dark mode preference (localStorage)

**Local Storage**:
- `access` - JWT access token
- `refresh` - JWT refresh token
- `dark` - Dark mode setting

---

## Database Models

### Entity Relationship Diagram

```
CustomUser ──1:N──> Book (author)
CustomUser ──1:N──> ReadingGroup (creator)
CustomUser ──M:N──> ReadingGroup (through UserToReadingGroupState)
CustomUser ──1:N──> Notification (directed_to, related_to)
ReadingGroup ──1:N──> Notification (related_group)
```

### Model Details

#### **CustomUser** (Extends AbstractUser)
Manages user accounts and profiles.

**Fields**:
- Django default: username, email, password, first_name, last_name
- `bio`: TextField - User biography
- `profile_picture`: ImageField - Profile image upload
- `profile_picture_url`: URLField - Alternative profile image URL
- `job_title`: CharField(100) - Professional title
- `facebook`, `youtube`, `instagram`, `twitter`, `linkedin`: URLFields - Social media links

**Relationships**:
- Author of multiple Books (ForeignKey)
- Creator of multiple ReadingGroups (ForeignKey)
- Member of multiple ReadingGroups (M2M through UserToReadingGroupState)
- Recipient/sender of Notifications

---

#### **Book**
Represents published or draft books/posts.

**Fields**:
- `title`: CharField(200) - Book title
- `slug`: SlugField (unique, auto-generated) - URL-safe identifier
- `description`: TextField - Book summary
- `content`: TextField - Full book text
- `category`: CharField with choices:
  - Science Fiction
  - Fantasy
  - Detective Fiction
  - Thriller
  - Romance
  - Horror
  - Historical Fiction
  - Adventure
- `featured_image`: ImageField - Book cover (upload to `book_img/`)
- `is_draft`: BooleanField (default=False) - Publication status
- `author`: ForeignKey → CustomUser (SET_NULL, null=True)
- `created_at`: DateTimeField (auto_now_add)
- `updated_at`: DateTimeField (auto_now)
- `published_date`: DateTimeField (auto_now_add)

**Methods**:
- `save()` - Auto-generates slug from title if not provided

---

#### **ReadingGroup**
Represents book clubs/reading groups.

**Fields**:
- `name`: CharField(200) - Group name
- `slug`: SlugField (unique, auto-generated) - URL-safe identifier
- `description`: TextField - Group description
- `featured_image`: ImageField - Group image (upload to `reading_group_img/`)
- `user`: ForeignKey → CustomUser (SET_NULL, null=True) - Group creator
- `members`: M2M → CustomUser (through UserToReadingGroupState) - Group members
- `created_at`: DateTimeField (auto_now_add)

**Methods**:
- `save()` - Auto-generates slug from name if not provided

**Meta**:
- Ordering: ['-created_at']
- Verbose name plural: "Reading Groups"

---

#### **UserToReadingGroupState**
Junction table tracking group membership status.

**Fields**:
- `user`: ForeignKey → CustomUser (CASCADE, related_name="readinggroups_state")
- `reading_group`: ForeignKey → ReadingGroup (CASCADE, related_name="members_state")
- `in_reading_group`: BooleanField (default=False)
  - `False` = Pending join request
  - `True` = Approved member

**Meta**:
- Ordering: ['in_reading_group']

**Purpose**: Enables two-tier approval system where users request to join and group creators approve.

---

#### **Notification**
Tracks group-related notifications.

**Fields**:
- `directed_to`: ForeignKey → CustomUser (CASCADE) - Recipient
- `related_to`: ForeignKey → CustomUser (CASCADE, related_name="related_to_notifications") - Source user
- `related_group`: ForeignKey → ReadingGroup (CASCADE) - Associated group
- `extra_text`: TextField - Additional information
- `sent_at`: DateTimeField (auto_now_add) - Timestamp
- `category`: CharField with choices:
  - GroupJoinRequest - User requests to join group
  - GroupRequestDeclined - Join request declined
  - GroupRequestAccepted - Join request approved

**Meta**:
- Ordering: ['-sent_at']

---

## API Documentation

**Base URL**: `http://localhost:8000/` (development)

### Authentication Endpoints

#### Obtain JWT Token
```http
POST /token/
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response 200:
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

#### Refresh JWT Token
```http
POST /token_refresh/
Content-Type: application/json

{
  "refresh": "jwt_refresh_token"
}

Response 200:
{
  "access": "new_jwt_access_token"
}
```

---

### User Endpoints

#### Register User
```http
POST /register_user/
Content-Type: multipart/form-data

{
  "username": "string",
  "email": "string",
  "password": "string",
  "first_name": "string",
  "last_name": "string",
  "profile_picture": "file" (optional)
}

Response 201: User created
Response 400: Validation errors
```

#### Update User Profile
```http
PUT /update_user/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

{
  "username": "string",
  "bio": "string",
  "job_title": "string",
  "profile_picture": "file",
  "facebook": "url",
  "twitter": "url",
  ...
}

Response 200: User updated
```

#### Get Current Username
```http
GET /get_username
Authorization: Bearer {access_token}

Response 200:
{
  "username": "string"
}
```

#### Get User Info
```http
GET /get_userinfo/{username}

Response 200:
{
  "id": "number",
  "username": "string",
  "email": "string",
  "bio": "string",
  "profile_picture": "url",
  "job_title": "string",
  "facebook": "url",
  "books": [
    {
      "id": "number",
      "title": "string",
      "slug": "string",
      "description": "string",
      "featured_image": "url",
      "category": "string",
      "created_at": "datetime"
    }
  ]
}
```

---

### Book Endpoints

#### List Books (Paginated)
```http
GET /book_list/{amount}/?page={page_number}

Example: /book_list/9/?page=1

Response 200:
{
  "count": "number",
  "next": "url",
  "previous": "url",
  "results": [
    {
      "id": "number",
      "title": "string",
      "slug": "string",
      "description": "string",
      "content": "string",
      "category": "string",
      "featured_image": "url",
      "is_draft": "boolean",
      "author": {
        "id": "number",
        "username": "string",
        "profile_picture": "url"
      },
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
}
```

#### Get Single Book
```http
GET /books/{slug}

Response 200:
{
  "id": "number",
  "title": "string",
  "slug": "string",
  "description": "string",
  "content": "string",
  "category": "string",
  "featured_image": "url",
  "author": {
    "id": "number",
    "username": "string",
    "profile_picture": "url"
  },
  "created_at": "datetime"
}
```

#### Create Book
```http
POST /create_book/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

{
  "title": "string",
  "description": "string",
  "content": "string",
  "category": "string",
  "featured_image": "file",
  "is_draft": "boolean"
}

Response 201: Book created
Response 401: Unauthorized
```

#### Update Book
```http
PUT /update_book/{id}/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

{
  "title": "string",
  "description": "string",
  "content": "string",
  "category": "string",
  "featured_image": "file",
  "is_draft": "boolean"
}

Response 200: Book updated
Response 403: Not authorized (user is not author)
```

#### Delete Book
```http
POST /delete_book/{id}/
Authorization: Bearer {access_token}

Response 200: Book deleted
Response 403: Not authorized (user is not author)
```

---

### Reading Group Endpoints

#### List Reading Groups (Paginated)
```http
GET /group_list/{amount}/?page={page_number}

Example: /group_list/9/?page=1

Response 200:
{
  "count": "number",
  "next": "url",
  "previous": "url",
  "results": [
    {
      "id": "number",
      "name": "string",
      "slug": "string",
      "description": "string",
      "featured_image": "url",
      "user": {
        "id": "number",
        "username": "string",
        "profile_picture": "url"
      },
      "members": [
        {
          "id": "number",
          "username": "string",
          "profile_picture": "url"
        }
      ],
      "created_at": "datetime"
    }
  ]
}
```

#### Get Single Reading Group
```http
GET /groups/{slug}

Response 200:
{
  "id": "number",
  "name": "string",
  "slug": "string",
  "description": "string",
  "featured_image": "url",
  "user": {
    "id": "number",
    "username": "string"
  },
  "members": [
    {
      "id": "number",
      "username": "string",
      "profile_picture": "url"
    }
  ],
  "created_at": "datetime"
}
```

#### Create Reading Group
```http
POST /create_group/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

{
  "name": "string",
  "description": "string",
  "featured_image": "file"
}

Response 201: Group created
Response 401: Unauthorized
```

#### Update Reading Group
```http
PUT /update_group/{id}/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

{
  "name": "string",
  "description": "string",
  "featured_image": "file"
}

Response 200: Group updated
Response 403: Not authorized (user is not creator)
```

#### Delete Reading Group
```http
POST /delete_group/{id}/
Authorization: Bearer {access_token}

Response 200: Group deleted
Response 403: Not authorized (user is not creator)
```

#### Join/Request to Join Group
```http
PUT /group/{id}/add_user/
Authorization: Bearer {access_token}

Response 200:
{
  "status": "User requested to join group" | "User added to group"
}
```

#### Leave Group
```http
PUT /group/{id}/remove_user/
Authorization: Bearer {access_token}

Response 200:
{
  "status": "User removed from group"
}
```

#### Approve User to Group
```http
PUT /group/{group_id}/confirm_user/{user_id}/
Authorization: Bearer {access_token}

Response 200:
{
  "status": "User confirmed in group"
}
Response 403: Not authorized (user is not group creator)
```

#### Get User's Group State
```http
GET /user_to_reading_group_state_list/{group_id}/
Authorization: Bearer {access_token}

Response 200:
{
  "in_reading_group": "boolean",
  "is_owner": "boolean"
}
```

---

### Notification Endpoints

#### List Notifications (Paginated)
```http
GET /notifications/{amount}/?page={page_number}
Authorization: Bearer {access_token}

Example: /notifications/9/?page=1

Response 200:
{
  "count": "number",
  "next": "url",
  "previous": "url",
  "results": [
    {
      "id": "number",
      "directed_to": "number",
      "related_to": {
        "id": "number",
        "username": "string",
        "profile_picture": "url"
      },
      "related_group": {
        "id": "number",
        "name": "string",
        "slug": "string"
      },
      "extra_text": "string",
      "sent_at": "datetime",
      "category": "string"
    }
  ]
}
```

#### Get Single Notification
```http
GET /get_notification/{id}/

Response 200:
{
  "id": "number",
  "directed_to": "number",
  "related_to": {
    "id": "number",
    "username": "string"
  },
  "related_group": {
    "id": "number",
    "name": "string"
  },
  "extra_text": "string",
  "sent_at": "datetime",
  "category": "string"
}
```

#### Create Notification
```http
POST /create_notification/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "directed_to": "number",
  "related_to": "number",
  "related_group": "number",
  "extra_text": "string",
  "category": "GroupJoinRequest" | "GroupRequestDeclined" | "GroupRequestAccepted"
}

Response 201: Notification created
```

#### Delete Notification
```http
POST /delete_notification/{id}/
Authorization: Bearer {access_token}

Response 200: Notification deleted
Response 403: Not authorized (user is not recipient)
```

---

## Authentication & Authorization

### JWT Token System

**Token Lifecycle**:
1. User logs in via `/token/` with username/password
2. Server returns `access` and `refresh` tokens
3. Frontend stores both in localStorage
4. Access token added to Authorization header: `Bearer {access_token}`
5. Access token expires after 60 minutes
6. Frontend validates expiry using `jwtDecode` before requests
7. Refresh token used to obtain new access token via `/token_refresh/`

**Token Validation** (Frontend):
```javascript
// api.js
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp > currentTime) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
```

### Authorization Patterns

**Backend Authorization**:
- Per-endpoint permission checks
- Author/creator validation on updates/deletes
- `IsAuthenticated` permission class on protected endpoints

**Frontend Route Protection**:
```javascript
// ProtectedRoute.jsx
- Checks for valid access token
- Attempts token refresh if expired
- Redirects to login if refresh fails
```

**Protected Endpoints**:
- All CREATE operations (books, groups, notifications)
- All UPDATE operations (books, groups, user profile)
- All DELETE operations
- Group membership operations (join, leave, approve)
- Current user info (`/get_username`)

**Public Endpoints**:
- Book/group listings and detail views
- User profile view
- Authentication (login, register)

---

## Key Features

### 1. User Management
- Custom user profiles with biography and job title
- Profile picture uploads or URL
- Social media links (Facebook, YouTube, Instagram, Twitter, LinkedIn)
- User registration and authentication
- Profile editing

### 2. Book Publishing
- Create, read, update, delete (CRUD) operations
- 8 book categories: Science Fiction, Fantasy, Detective Fiction, Thriller, Romance, Horror, Historical Fiction, Adventure
- Draft/published status toggle
- Featured image uploads
- Auto-generated URL slugs from titles
- Rich text content support
- Author-only edit/delete permissions

### 3. Reading Groups
- Create book clubs/reading groups
- Group descriptions and featured images
- Two-tier membership system:
  - **Pending**: User requests to join (`in_reading_group=False`)
  - **Approved**: Group creator confirms membership (`in_reading_group=True`)
- Member list with profile pictures
- Creator-only edit/delete permissions
- Join/leave functionality

### 4. Notification System
- Three notification types:
  - **GroupJoinRequest**: User requests to join group
  - **GroupRequestAccepted**: Creator approves request
  - **GroupRequestDeclined**: Creator declines request
- Tracks source user, recipient, and related group
- Paginated notification list
- Recipient-only deletion

### 5. Pagination
- Custom `AnyListPagination` class
- Dynamic page size from request parameter
- Smooth pagination with `keepPreviousData` (React Query)
- Used for books (3 on home, 9 on all books), groups (9), notifications (9)

### 6. Media Handling
- Profile pictures: `media/profile_img/`
- Book images: `media/book_img/`
- Reading group images: `media/reading_group_img/`
- Media served at `/img/` URL prefix

### 7. Dark Mode
- Toggle in AppLayout NavBar
- Persisted in localStorage
- Tailwind CSS class-based strategy
- Applies to all pages

### 8. Responsive Design
- Mobile-friendly navigation (hamburger menu)
- Responsive grid layouts
- Breakpoints: max-sm, max-md, lg
- Touch-friendly UI components

---

## Setup & Installation

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 13+

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment variables** (create `.env` file):
```env
SECRET_KEY=your_django_secret_key
DEBUG=True
DATABASE_NAME=your_db_name
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_HOST=your_db_host
DATABASE_PORT=your_db_port
```

5. **Run migrations**:
```bash
python manage.py migrate
```

6. **Create superuser** (optional):
```bash
python manage.py createsuperuser
```

7. **Run development server**:
```bash
python manage.py runserver
```

Backend will be available at `http://localhost:8000/`

---

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables** (create `.env` file):
```env
VITE_BASE_URL=http://localhost:8000
```

4. **Run development server**:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5174/`

---

### Database Setup

**PostgreSQL Configuration**:
1. Create database: `CREATE DATABASE book_club;`
2. Create user: `CREATE USER book_club_user WITH PASSWORD 'your_password';`
3. Grant privileges: `GRANT ALL PRIVILEGES ON DATABASE book_club TO book_club_user;`
4. Update `.env` file with credentials

---

### Production Deployment

**Backend**:
1. Set `DEBUG=False` in settings
2. Configure `ALLOWED_HOSTS`
3. Set up static file serving
4. Use Gunicorn: `gunicorn book_api.wsgi:application`
5. Configure CORS origins for production domain

**Frontend**:
1. Build production bundle: `npm run build`
2. Serve `dist/` directory with web server (Nginx, Apache)
3. Update `VITE_BASE_URL` to production API URL

---

## API Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Known Issues & Future Enhancements

### Current Issues
1. **Duplicate Routes**: Multiple routes for same functionality (e.g., `/book_list/<amount>/` and `/books/`)
2. **Inconsistent Naming**: URL endpoint naming conventions vary
3. **Limited Error Handling**: Some endpoints lack comprehensive error responses
4. **Code Comments**: Multiple "REM" and "HERE FFS" comments indicate incomplete refactoring

### Potential Enhancements
1. Implement book comments/discussions
2. Add book ratings/reviews
3. Group discussion forums
4. Private messaging between users
5. Book recommendation system
6. Email notifications
7. Advanced search and filtering
8. User following/followers
9. Reading progress tracking
10. Book sharing to groups

---

## Development Notes

### Backend Logging
- Log file: `backend/bookapp/app.log`
- Console logging enabled
- Configurable log levels

### CORS Configuration
- Development: localhost:5173, 5174, 5175
- Production: Configured in settings.py

### Media Files
- Local development: Served by Django dev server
- Production: Use web server (Nginx) or cloud storage (S3, Cloudinary)

---

## Contributing

When contributing to this project:
1. Follow existing code style and patterns
2. Update serializers when modifying models
3. Run migrations after model changes: `python manage.py makemigrations && python manage.py migrate`
4. Test API endpoints with authenticated and unauthenticated users
5. Ensure responsive design on mobile devices
6. Update documentation for new features

---

## License

[Specify your license here]

---

## Contact & Support

[Add your contact information or support channels]

---

**Last Updated**: January 27, 2026
