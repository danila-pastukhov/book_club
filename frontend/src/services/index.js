/**
 * Central API exports for backward compatibility
 * 
 * This file re-exports all API functions from domain-specific modules.
 * You can import from individual modules (recommended) or from this index file.
 * 
 * Example usage:
 * 
 * Recommended (direct import):
 * import { getBooks, createBook } from '@/services/apiBooks'
 * import { signin, registerUser } from '@/services/apiAuth'
 * 
 * Legacy (from index):
 * import { getBooks, signin } from '@/services'
 */

// Authentication & User Profile
export {
  registerUser,
  signin,
  getUsername,
  getUserInfo,
  updateProfile,
  getUserBooks,
  getUserStats,
} from './apiAuth'

// Books & Reading Progress
export {
  getBooks,
  getPublicBooks,
  getBook,
  searchBooksByHashtag,
  getRecentReadingBooks,
  getBookPage,
  getBookChapter,
  getBookChaptersList,
  createBook,
  updateBook,
  deleteBook,
  getReadingProgress,
  updateReadingProgress,
  completeBook,
} from './apiBooks'

// Reading Groups & Membership
export {
  getReadingGroups,
  getUserReadingGroups,
  getUserCreatedGroups,
  getReadingGroup,
  getUserToReadingGroupStates,
  createReadingGroup,
  updateReadingGroup,
  deleteReadingGroup,
  addUserToGroup,
  removeUserFromGroup,
  kickUserFromGroup,
  confirmUserToGroup,
  getGroupReadingBooks,
  getGroupPostedBooks,
} from './apiGroups'

// Comments, Replies & Reviews
export {
  getBookComments,
  createBookComment,
  getBookComment,
  updateBookComment,
  deleteBookComment,
  getCommentReplies,
  createCommentReply,
  updateCommentReply,
  deleteCommentReply,
  getBookReviews,
  createBookReview,
} from './apiComments'

// Gamification: Quests, Rewards, Prize Boards
export {
  getRewardTemplates,
  createRewardTemplate,
  deleteRewardTemplate,
  getQuestTemplates,
  createQuestTemplate,
  updateQuestTemplate,
  deleteQuestTemplate,
  getMyRewards,
  getMyRewardPlacements,
  getUserRewards,
  getQuests,
  getGroupQuests,
  generateDailyQuests,
  createQuest,
  getQuestProgress,
  getMyQuests,
  generateDailyPersonalQuests,
  getPrizeBoard,
  updatePrizeBoardSettings,
  placeRewardOnBoard,
  removeRewardFromBoard,
  getUserPrizeBoard,
  placeRewardOnUserBoard,
  removeRewardFromUserBoard,
} from './apiGamification'

// Notifications
export {
  getNotifications,
  getNotification,
  createNotification,
  deleteNotification,
} from './apiNotifications'
