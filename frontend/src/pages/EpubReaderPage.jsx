import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ReactReader } from 'react-reader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBook,
  getBookChaptersList,
  getBookComments,
  createBookComment,
  updateBookComment,
  deleteBookComment,
  getUsername,
} from '@/services/apiBook';
import SmallSpinner from '@/ui_components/SmallSpinner';
import CommentButton from '@/ui_components/CommentButton';
import CommentForm from '@/ui_components/CommentForm';
import CommentsSidebar from '@/ui_components/CommentsSidebar';
import { IoHomeOutline, IoCloseOutline } from 'react-icons/io5';
import { FiChevronLeft, FiChevronRight, FiList } from 'react-icons/fi';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { BiMessageSquareDetail } from 'react-icons/bi';

const EpubReaderPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [location, setLocation] = useState(null);
  const [fontSize, setFontSize] = useState(100);
  const [showToc, setShowToc] = useState(false);
  const [rendition, setRendition] = useState(null);
  const [tocFromEpub, setTocFromEpub] = useState([]);

  // Comment-related state
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(true);
  const [showCommentButton, setShowCommentButton] = useState(false);
  const [commentButtonPosition, setCommentButtonPosition] = useState({ x: 0, y: 0 });
  const [selectedTextData, setSelectedTextData] = useState(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [activeCommentId, setActiveCommentId] = useState(null);

  // Get reading group ID from URL params
  const readingGroupId = searchParams.get('reading_group_id');

  // Fetch book data
  const { data: book, isLoading: bookLoading, error: bookError } = useQuery({
    queryKey: ['book', slug],
    queryFn: () => getBook(slug),
  });

  // Fetch chapters list
  const { data: chaptersData } = useQuery({
    queryKey: ['bookChapters', slug],
    queryFn: () => getBookChaptersList(slug),
    enabled: !!book && book.content_type === 'epub',
  });

  // Fetch current user
  const { data: userData } = useQuery({
    queryKey: ['username'],
    queryFn: getUsername,
  });

  // Fetch comments
  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery({
    queryKey: ['bookComments', slug, readingGroupId],
    queryFn: () => getBookComments(slug, readingGroupId),
    enabled: !!book && !!readingGroupId,
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: (data) => createBookComment(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookComments', slug, readingGroupId]);
      setShowCommentForm(false);
      setSelectedTextData(null);
      setShowCommentButton(false);
    },
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, data }) => updateBookComment(slug, commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookComments', slug, readingGroupId]);
      setShowCommentForm(false);
      setEditingComment(null);
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => deleteBookComment(slug, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookComments', slug, readingGroupId]);
    },
  });

  // Apply font size when rendition is ready
  useEffect(() => {
    if (rendition) {
      rendition.themes.fontSize(`${fontSize}%`);
    }
  }, [fontSize, rendition]);

  // Setup text selection listener for comments
  useEffect(() => {
    if (rendition && readingGroupId) {
      rendition.on('selected', (cfiRange, contents) => {
        const selection = contents.window.getSelection();
        const text = selection.toString().trim();

        if (text.length > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          // Get the iframe element that contains the EPUB content
          const iframe = contents.document.defaultView.frameElement;

          if (iframe) {
            const iframeRect = iframe.getBoundingClientRect();

            // Calculate position relative to the main page
            // Add iframe offset to the selection rect position
            setCommentButtonPosition({
              x: iframeRect.left + rect.left + rect.width / 2,
              y: iframeRect.top + rect.top + window.scrollY,
            });
          } else {
            // Fallback if iframe not found
            setCommentButtonPosition({
              x: rect.left + rect.width / 2,
              y: rect.top + window.scrollY,
            });
          }

          setSelectedTextData({
            cfiRange,
            text,
            contents,
          });

          setShowCommentButton(true);
        }
      });

      // Clear selection button on click
      rendition.on('click', () => {
        setShowCommentButton(false);
      });
    }
  }, [rendition, readingGroupId]);

  // Render comment highlights
  useEffect(() => {
    if (rendition && comments && comments.length > 0) {
      // Clear existing annotations
      rendition.annotations.remove();

      // Add highlights for each comment
      comments.forEach((comment) => {
        rendition.annotations.add(
          'highlight',
          comment.cfi_range,
          {},
          (e) => {
            // Click handler - highlight the comment in sidebar
            setActiveCommentId(comment.id);
          },
          'epub-comment-highlight',
          {
            fill: comment.highlight_color,
            'fill-opacity': '0.3',
            'mix-blend-mode': 'multiply',
          }
        );
      });
    }
  }, [rendition, comments]);

  // Handle window resize to keep navigation working
  useEffect(() => {
    const handleResize = () => {
      if (rendition) {
        rendition.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [rendition]);

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 10, 200));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 10, 50));
  };

  const goToPrevPage = () => {
    if (rendition) {
      rendition.prev();
    }
  };

  const goToNextPage = () => {
    if (rendition) {
      rendition.next();
    }
  };

  const handleChapterClick = (href) => {
    if (rendition) {
      rendition.display(href);
      setShowToc(false);
    }
  };

  // Comment handlers
  const handleOpenCommentForm = () => {
    setShowCommentForm(true);
    setShowCommentButton(false);
  };

  const handleCloseCommentForm = () => {
    setShowCommentForm(false);
    setEditingComment(null);
  };

  const handleSubmitComment = (formData) => {
    if (editingComment) {
      // Update existing comment
      updateCommentMutation.mutate({
        commentId: editingComment.id,
        data: formData,
      });
    } else {
      // Create new comment
      createCommentMutation.mutate({
        reading_group: parseInt(readingGroupId),
        cfi_range: selectedTextData.cfiRange,
        selected_text: selectedTextData.text,
        ...formData,
      });
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setShowCommentForm(true);
  };

  const handleDeleteComment = (commentId) => {
    deleteCommentMutation.mutate(commentId);
  };

  const handleJumpToComment = (cfiRange) => {
    if (rendition) {
      rendition.display(cfiRange);
    }
  };

  const handleToggleCommentsSidebar = () => {
    setShowCommentsSidebar((prev) => !prev);
  };

  if (bookLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <SmallSpinner />
      </div>
    );
  }

  if (bookError || !book) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error loading book</p>
      </div>
    );
  }

  if (book.content_type !== 'epub') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">This book is not in EPUB format</p>
      </div>
    );
  }

  if (!book.epub_file) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">EPUB file not found</p>
      </div>
    );
  }

  // Construct EPUB file URL
  const epubUrl = book.epub_file.startsWith('http')
    ? book.epub_file
    : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${book.epub_file}`;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#181A2A]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#141624] shadow-md">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <IoHomeOutline size={24} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white truncate max-w-md">
              {book.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Font size controls */}
            <div className="flex items-center gap-2 border rounded-lg px-3 py-1 dark:border-gray-600">
              <button
                onClick={decreaseFontSize}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                title="Decrease font size"
              >
                <AiOutlineMinus size={18} />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
                {fontSize}%
              </span>
              <button
                onClick={increaseFontSize}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                title="Increase font size"
              >
                <AiOutlinePlus size={18} />
              </button>
            </div>

            {/* Comments toggle - only show if reading group is specified */}
            {readingGroupId && (
              <button
                onClick={handleToggleCommentsSidebar}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showCommentsSidebar
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title="Toggle comments"
              >
                <BiMessageSquareDetail size={20} />
                <span className="max-sm:hidden">Comments</span>
                {comments && comments.length > 0 && (
                  <span className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {comments.length}
                  </span>
                )}
              </button>
            )}

            {/* TOC toggle */}
            <button
              onClick={() => setShowToc(!showToc)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiList size={20} />
              <span className="max-sm:hidden">Chapters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reader Container with TOC Sidebar and Comments */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Reader */}
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
          <ReactReader
            url={epubUrl}
            location={location}
            locationChanged={setLocation}
            getRendition={(rend) => {
              setRendition(rend);
              // Apply initial font size
              rend.themes.fontSize(`${fontSize}%`);
            }}
            epubOptions={{
              flow: 'paginated',
              manager: 'continuous',
            }}
            tocChanged={(toc) => {
              console.log('TOC:', toc);
              setTocFromEpub(toc);
            }}
            showToc={false}
            styles={{
              container: {
                height: '100%',
                overflow: 'hidden',
              },
            }}
          />
        </div>

        {/* Comments Sidebar */}
        {readingGroupId && showCommentsSidebar && (
          <CommentsSidebar
            comments={comments}
            currentUser={userData?.username}
            isLoading={commentsLoading}
            error={commentsError?.message}
            onClose={handleToggleCommentsSidebar}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
            onJumpTo={handleJumpToComment}
            activeCommentId={activeCommentId}
          />
        )}

        {/* Custom TOC Sidebar on the right */}
        {showToc && (
          <div
            className="w-80 bg-white dark:bg-[#141624] border-l dark:border-gray-700 overflow-y-auto"
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-[#141624] border-b dark:border-gray-700 px-4 py-3 flex justify-between items-center z-10">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Chapters
              </h2>
              <button
                onClick={() => setShowToc(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <IoCloseOutline size={24} />
              </button>
            </div>
            <div className="p-4">
              {tocFromEpub && tocFromEpub.length > 0 ? (
                <ul className="space-y-2">
                  {tocFromEpub.map((item, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleChapterClick(item.href)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                        style={{ paddingLeft: `${(item.level || 0) * 12 + 12}px` }}
                      >
                        {item.label || item.title || `Chapter ${index + 1}`}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : chaptersData?.chapters && chaptersData.chapters.length > 0 ? (
                <ul className="space-y-2">
                  {chaptersData.chapters.map((chapter, index) => (
                    <li key={chapter.id || index}>
                      <button
                        onClick={() => handleChapterClick(chapter.href)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        {chapter.title || `Chapter ${index + 1}`}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No chapters available
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
          <button
            onClick={goToPrevPage}
            className="bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Previous page"
          >
            <FiChevronLeft size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={goToNextPage}
            className="bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Next page"
          >
            <FiChevronRight size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Chapter info (if available) */}
      {chaptersData && (
        <div className="px-6 py-2 bg-gray-50 dark:bg-[#141624] border-t dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {chaptersData.chapters?.length || 0} chapters available
          </p>
        </div>
      )}

      {/* Floating Comment Button */}
      {readingGroupId && (
        <CommentButton
          position={commentButtonPosition}
          onClick={handleOpenCommentForm}
          visible={showCommentButton}
        />
      )}

      {/* Comment Form Modal */}
      {showCommentForm && (
        <CommentForm
          selectedText={editingComment ? null : selectedTextData?.text}
          onSubmit={handleSubmitComment}
          onCancel={handleCloseCommentForm}
          initialComment={editingComment?.comment_text || ''}
          isEditing={!!editingComment}
          isSubmitting={
            createCommentMutation.isPending || updateCommentMutation.isPending
          }
        />
      )}
    </div>
  );
};

export default EpubReaderPage;
