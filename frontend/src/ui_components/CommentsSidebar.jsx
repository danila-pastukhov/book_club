import { IoCloseOutline } from 'react-icons/io5';
import { BiMessageSquareDetail } from 'react-icons/bi';
import CommentCard from './CommentCard';
import SmallSpinner from './SmallSpinner';

const CommentsSidebar = ({
  comments,
  currentUser,
  isLoading,
  error,
  onClose,
  onEdit,
  onDelete,
  onJumpTo,
  activeCommentId,
}) => {
  return (
    <div className="w-96 bg-white dark:bg-[#141624] border-l dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-[#141624] border-b dark:border-gray-700 px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <BiMessageSquareDetail size={24} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Comments
          </h2>
          {!isLoading && comments && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({comments.length})
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <IoCloseOutline size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-32">
            <SmallSpinner />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400 mb-2">
              Failed to load comments
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {error}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && comments && comments.length === 0 && (
          <div className="text-center py-12">
            <BiMessageSquareDetail
              size={48}
              className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
            />
            <p className="text-gray-500 dark:text-gray-400 mb-1">
              No comments yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Select text and add a comment to start the discussion
            </p>
          </div>
        )}

        {/* Comments List */}
        {!isLoading && !error && comments && comments.length > 0 && (
          <div>
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                currentUser={currentUser}
                onEdit={onEdit}
                onDelete={onDelete}
                onJumpTo={onJumpTo}
                isActive={activeCommentId === comment.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {!isLoading && !error && comments && comments.length > 0 && (
        <div className="border-t dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-[#0F1117]">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Click on a comment to jump to its location
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentsSidebar;
