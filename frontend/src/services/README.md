# API Services

This directory contains all API communication functions, organized by domain.

## Structure

```
services/
├── apiAuth.js          # Authentication & User Profile
├── apiBooks.js         # Books & Reading Progress
├── apiGroups.js        # Reading Groups & Membership
├── apiComments.js      # Comments, Replies & Reviews
├── apiGamification.js  # Quests, Rewards & Prize Boards
├── apiNotifications.js # Notifications
└── index.js            # Central re-export (for backward compatibility)
```

## Usage

### Recommended (Direct Import)

Import functions directly from domain-specific modules:

```javascript
// Authentication
import { signin, registerUser, getUserInfo } from '@/services/apiAuth'

// Books
import { getBooks, createBook, getBook } from '@/services/apiBooks'

// Groups
import { getReadingGroups, createReadingGroup } from '@/services/apiGroups'

// Comments
import { getBookComments, createBookComment } from '@/services/apiComments'

// Gamification
import { getMyQuests, generateDailyQuests } from '@/services/apiGamification'

// Notifications
import { getNotifications, deleteNotification } from '@/services/apiNotifications'
```

### Legacy (From Index)

For backward compatibility, all functions are re-exported from `index.js`:

```javascript
import { getBooks, signin, getNotifications } from '@/services'
```

## Modules Overview

### apiAuth.js
**Authentication & User Profile**
- `registerUser(data)` - Register new user
- `signin(data)` - Login with credentials
- `getUsername()` - Get current username
- `getUserInfo(username)` - Get user profile info
- `updateProfile(data)` - Update user profile
- `getUserBooks(username)` - Get user's books
- `getUserStats(username)` - Get user statistics

### apiBooks.js
**Books & Reading Progress**
- `getBooks(page, amount)` - Get paginated book list
- `getPublicBooks(page, amount)` - Get public books
- `getBook(slug, info_only)` - Get book details
- `searchBooksByHashtag(tag, page, amount)` - Search by hashtag
- `getRecentReadingBooks(page, amount)` - Get recently read books
- `getBookChapter(slug, chapterId)` - Get EPUB chapter
- `getBookChaptersList(slug)` - Get book's TOC
- `createBook(data)` - Create new book
- `updateBook(data, id)` - Update book
- `deleteBook(id)` - Delete book
- `getReadingProgress(slug)` - Get reading progress
- `updateReadingProgress(slug, data)` - Update progress
- `completeBook(slug)` - Mark book as completed

### apiGroups.js
**Reading Groups & Membership**
- `getReadingGroups(page, amount)` - Get all groups
- `getUserReadingGroups()` - Get user's groups
- `getUserCreatedGroups()` - Get groups created by user
- `getReadingGroup(slug)` - Get group details
- `createReadingGroup(data)` - Create group
- `updateReadingGroup(data, id)` - Update group
- `deleteReadingGroup(id)` - Delete group
- `addUserToGroup(id)` - Request to join group
- `removeUserFromGroup(id)` - Leave group
- `kickUserFromGroup(groupId, userId)` - Kick user (admin)
- `confirmUserToGroup(groupId, userId)` - Confirm join request (admin)
- `getGroupReadingBooks(slug)` - Get books being read by group
- `getGroupPostedBooks(slug)` - Get books posted to group

### apiComments.js
**Comments, Replies & Reviews**
- `getBookComments(slug, readingGroupId)` - Get comments
- `createBookComment(slug, data)` - Create comment
- `updateBookComment(slug, commentId, data)` - Update comment
- `deleteBookComment(slug, commentId)` - Delete comment
- `getCommentReplies(slug, commentId)` - Get replies
- `createCommentReply(slug, commentId, data)` - Create reply
- `updateCommentReply(slug, commentId, replyId, data)` - Update reply
- `deleteCommentReply(slug, commentId, replyId)` - Delete reply
- `getBookReviews(slug)` - Get book reviews
- `createBookReview(slug, data)` - Create review

### apiGamification.js
**Quests, Rewards & Prize Boards**
- **Reward Templates:**
  - `getRewardTemplates()` - Get all templates
  - `createRewardTemplate(data)` - Create template
  - `deleteRewardTemplate(templateId)` - Delete template
- **Quest Templates:**
  - `getQuestTemplates()` - Get all templates
  - `createQuestTemplate(data)` - Create template
  - `updateQuestTemplate(templateId, data)` - Update template
  - `deleteQuestTemplate(templateId)` - Delete template
- **User Rewards:**
  - `getMyRewards()` - Get current user's rewards
  - `getMyRewardPlacements()` - Get reward placements
  - `getUserRewards(username)` - Get user's rewards
- **Quests:**
  - `getQuests()` - Get all quests
  - `getGroupQuests(slug)` - Get group quests
  - `generateDailyQuests(slug)` - Generate daily group quests
  - `createQuest(data)` - Create custom quest
  - `getQuestProgress(questId)` - Get quest progress
  - `getMyQuests()` - Get personal quests
  - `generateDailyPersonalQuests()` - Generate daily personal quests
- **Prize Boards:**
  - `getPrizeBoard(slug)` - Get group prize board
  - `placeRewardOnBoard(slug, data)` - Place reward on group board
  - `removeRewardFromBoard(slug, x, y)` - Remove from group board
  - `getUserPrizeBoard(username)` - Get user prize board
  - `placeRewardOnUserBoard(username, data)` - Place on user board
  - `removeRewardFromUserBoard(username, x, y)` - Remove from user board

### apiNotifications.js
**Notifications**
- `getNotifications(page, amount)` - Get paginated notifications
- `getNotification(id)` - Get single notification
- `createNotification(data)` - Create notification
- `deleteNotification(id)` - Delete notification

## Migration Guide

If you're updating code that uses the old `apiBook.js`:

**Before:**
```javascript
import { getBooks, signin, createComment } from '@/services/apiBook'
```

**After:**
```javascript
import { getBooks } from '@/services/apiBooks'
import { signin } from '@/services/apiAuth'
import { createBookComment } from '@/services/apiComments'
```

Or use the index for temporary compatibility:
```javascript
import { getBooks, signin, createBookComment } from '@/services'
```

## Error Handling

All API functions throw errors with descriptive messages. Use try-catch when calling:

```javascript
try {
  const books = await getBooks(1, 20)
} catch (error) {
  console.error(error.message)
  toast.error(error.message)
}
```

## Notes

- All functions use the shared `api` axios instance from `@/api.js`
- JWT authentication is handled automatically by request interceptor
- Response errors are formatted consistently across all modules
