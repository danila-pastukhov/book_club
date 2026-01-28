# Tasks to Implement EPUB Format Support

## Project Goal
Add feature to load, store and view content of books in epub format while maintaining backward compatibility with existing plain text books.

---

## Backend Tasks

### Task 1: Database Model Enhancement
**File:** `backend/bookapp/models.py`

**Changes needed:**
- Add `epub_file` field (FileField) to Book model for storing epub files
- Add `content_type` field (CharField with choices: 'plaintext', 'epub') to track book format
- Keep existing `content` TextField for backward compatibility with plain text books
- Consider adding fields for epub metadata:
  - `page_count` (IntegerField)
  - `table_of_contents` (JSONField)

**Example:**
```python
content_type = models.CharField(
    max_length=20,
    choices=[('plaintext', 'Plain Text'), ('epub', 'EPUB')],
    default='plaintext'
)
epub_file = models.FileField(upload_to='epub_files/', blank=True, null=True)
table_of_contents = models.JSONField(blank=True, null=True)
```

---

### Task 2: EPUB Processing Library Integration

**Changes needed:**
- Install Python library: `ebooklib` or `epub-parser`
- Add to `backend/requirements.txt`
- Create new utility module: `backend/bookapp/epub_handler.py`

**Utility functions to implement:**
- Extract text content from epub
- Parse chapter structure and table of contents
- Extract embedded images
- Convert epub HTML to display-ready format
- Validate epub file structure

**Example functions:**
```python
def parse_epub(epub_file_path):
    """Parse epub and extract metadata"""
    pass

def get_epub_chapters(epub_file_path):
    """Get list of chapters with content"""
    pass

def get_epub_toc(epub_file_path):
    """Extract table of contents"""
    pass
```

---

### Task 3: Serializer Updates
**File:** `backend/bookapp/serializers.py`

**Changes needed:**
- Update `BookSerializer` to handle `epub_file` and `content_type` fields
- Modify `to_representation()` method to:
  - Return structured content for epub books (chapters, TOC)
  - Return plain text for legacy books
  - Include epub metadata (chapter count, navigation info)
- Add validation for epub files

**Current code location:** Lines 86-111 in serializers.py

---

### Task 4: API Views Enhancement
**File:** `backend/bookapp/views.py`

**Changes needed:**

1. **UPDATE CREATE_BOOK** (currently at line 153)
   - Accept epub file uploads in addition to text content
   - Add epub validation (file type, size limits)
   - Process epub on upload: extract text, chapters, TOC
   - Store epub file and metadata

2. **UPDATE GET_BOOK** (currently at line 58)
   - Return appropriate format based on content_type
   - Include chapter structure for epub books

3. **CREATE NEW ENDPOINT: GET_BOOK_CHAPTER**
   - Route: `books/<slug:slug>/chapters/<int:chapter_id>/`
   - Purpose: Fetch individual chapters for epub books
   - Returns: Single chapter content with navigation info

**Example new endpoint:**
```python
@api_view(["GET"])
def get_book_chapter(request, slug, chapter_id):
    """Get specific chapter from epub book"""
    pass
```

---

### Task 5: File Storage Configuration
**File:** `backend/book_api/settings.py`

**Changes needed:**
- Configure epub upload directory (e.g., `epub_files/`)
- Set file size limits for epub uploads (e.g., 50MB max)
- Configure allowed file extensions validation

**Add to settings:**
```python
# EPUB file handling
EPUB_UPLOAD_DIR = 'epub_files/'
MAX_EPUB_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EPUB_EXTENSIONS = ['.epub']
```

---

## Frontend Tasks

### Task 6: Upload Interface Update
**File:** `frontend/src/pages/CreatePostPage.jsx`

**Changes needed:**
- Add radio buttons or toggle to choose between "Plain Text" and "Epub Upload"
- Add epub file input field (similar to featured_image handling at lines 56-72)
- Conditionally show/hide `content` textarea based on upload type
- Update form validation to handle epub files
- Display epub file name after upload
- Update FormData submission to include epub file

**UI Elements to add:**
- Content type selector (radio buttons)
- Epub file input (only shown when "Epub" selected)
- File name display after selection
- Updated validation messages

---

### Task 7: EPUB Reader Component
**New file:** `frontend/src/pages/EpubReaderPage.jsx`

**Purpose:** Create dedicated epub reader to replace BookPagesPage for epub books

**Features to implement:**
- Integrate epub rendering library (recommend: `epubjs` or `react-reader`)
- Chapter navigation (previous/next)
- Table of contents sidebar (collapsible)
- Progress indicator (% completed, current chapter)
- Font size adjustment controls
- Page/chapter bookmark functionality
- Text selection (maintain existing feature from BookPagesPage)
- Dark mode support

**Dependencies to add:**
```json
"epubjs": "^0.3.93"
or
"react-reader": "^2.0.0"
```

**Route:** `/books/<slug>/page` (when content_type is 'epub')

---

### Task 8: Book Display Logic Update
**Files:**
- `frontend/src/pages/DetailPage.jsx`
- `frontend/src/pages/BookPagesPage.jsx`

**Changes needed:**

1. **DetailPage.jsx:**
   - Detect book content_type from API response
   - Update "Read book" button to route based on type:
     - Plain text → `/books/{slug}/page` (BookPagesPage)
     - Epub → `/books/{slug}/page` (EpubReaderPage)
   - Display content type badge/indicator

2. **BookPagesPage.jsx:**
   - Add conditional rendering based on content_type
   - Route to EpubReaderPage if epub, otherwise use existing pagination logic
   - Or: Keep separate routes for clarity

**Recommended approach:** Use same route but conditionally render different components

---

### Task 9: API Service Updates
**File:** `frontend/src/services/apiBook.js`

**Changes needed:**
- Update `createBook()` to handle epub files in FormData
- Update `updateBook()` to handle epub files
- Add new function: `getBookChapter(slug, chapterId)` for fetching specific chapters
- Handle larger response sizes for epub content
- Add proper error handling for epub-specific errors

**New functions to add:**
```javascript
export const getBookChapter = async (slug, chapterId) => {
  const response = await api.get(`/books/${slug}/chapters/${chapterId}/`);
  return response.data;
};
```

---

## Infrastructure & Quality Tasks

### Task 10: File Validation & Security

**Backend validation needed:**
- Validate epub file structure (not just extension)
- Check file is valid zip archive
- Scan for potentially malicious content
- Verify required epub files exist (mimetype, META-INF/container.xml)
- Set appropriate file size limits
- Handle corrupted epub files gracefully with error messages

**File:** `backend/bookapp/validators.py` (create new)

---

### Task 11: Performance Optimization

**Optimizations needed:**
- Implement lazy loading for epub chapters (don't load entire book at once)
- Cache parsed epub data to avoid re-processing on every request
- Consider background processing for large epub files (Celery task)
- Add progress indicator during epub upload/processing
- Optimize database queries for epub metadata
- Consider CDN for serving epub files

**Technologies to consider:**
- Redis for caching parsed content
- Celery for background processing
- Django signals for post-upload processing

---

### Task 12: Backward Compatibility

**Ensure:**
- All existing plain text books continue to work without changes
- Book list pages (HomePage, AllBooksPage) display both types correctly
- Search and filtering work for both types
- Update/edit functionality works for both types
- Default content_type is 'plaintext' for existing books

**Migration needed:**
- Create Django migration to add new fields with proper defaults
- Ensure existing books get content_type='plaintext'

**File:** Create migration in `backend/bookapp/migrations/`

---

### Task 13: Testing

**Test scenarios:**
- Upload epub files (various versions: epub2, epub3)
- Upload epub with different structures (with/without images, complex TOC)
- Upload plain text books (ensure backward compatibility)
- Test file size limits and rejection
- Test corrupted epub handling
- Test chapter navigation
- Test text selection in epub reader
- Test edit/update for both content types
- Test deletion of epub books (ensure files are deleted)
- Test responsive design on mobile

**Files to create:**
- `backend/bookapp/tests/test_epub_upload.py`
- `backend/bookapp/tests/test_epub_parsing.py`
- Frontend tests for epub reader component

---

## Optional Enhancements (Phase 2)

### Task 14: Advanced Features

**Features to consider:**
- Support for epub images embedded in content
- Highlighting and annotation persistence (save to database)
- Reading progress tracking across sessions
- Export user annotations to file
- Support for additional formats (PDF, MOBI conversion)
- Epub validation and repair tools
- Bulk epub upload
- Epub preview before publishing

---

### Task 15: User Experience Enhancements

**UX improvements:**
- Customizable themes for epub reader (dark/light mode)
- Font family selection (serif, sans-serif, monospace)
- Adjustable font size, line spacing, margins
- Offline reading support (PWA capabilities)
- Mobile-responsive epub reader with swipe gestures
- Reading statistics (time spent, pages read)
- Bookmarks and notes UI
- Search within book content
- Share quotes/passages

---

## Recommended Implementation Order

### Phase 1: Core Functionality (MVP)
1. **Task 1:** Database model changes
2. **Task 2:** EPUB processing library integration
3. **Task 3:** Serializer updates
4. **Task 4:** Backend API updates
5. **Task 5:** File storage configuration
6. **Task 6:** Upload interface update
7. **Task 7:** EPUB reader component
8. **Task 8:** Book display logic update
9. **Task 9:** API service updates

**Estimated effort:** Core functionality implementation

---

### Phase 2: Quality & Compatibility
10. **Task 10:** File validation & security
11. **Task 11:** Performance optimization
12. **Task 12:** Backward compatibility testing
13. **Task 13:** Comprehensive testing

**Estimated effort:** Quality assurance and optimization

---

### Phase 3: Enhancements (Optional)
14. **Task 14:** Advanced features
15. **Task 15:** User experience enhancements

**Estimated effort:** Feature expansion based on user feedback

---

## Technical Dependencies

### Backend
- `ebooklib` or `epub-parser` - EPUB parsing
- `Pillow` - Already installed for image handling
- `celery` (optional) - Background task processing
- `redis` (optional) - Caching

### Frontend
- `epubjs` or `react-reader` - EPUB rendering
- Existing dependencies: react-query, react-router, react-hook-form

---

## Notes & Considerations

1. **Storage:** EPUB files can be large (5-50MB). Consider cloud storage (S3, Google Cloud Storage) for production.

2. **Processing:** Large EPUB files may timeout on synchronous processing. Consider async processing with progress updates.

3. **Format Support:** Focus on EPUB 2 and EPUB 3 standards. Consider if reflowable vs. fixed-layout support needed.

4. **Accessibility:** Ensure EPUB reader maintains accessibility features (screen reader support, keyboard navigation).

5. **Copyright:** Add functionality to mark books as copyrighted and handle usage rights if needed.

6. **Migration Path:** Provide tools to convert existing plain text books to EPUB format if desired.

---

## Questions to Address

- [ ] Should users be able to download EPUB files?
- [ ] Should there be EPUB-to-plaintext conversion option?
- [ ] What's the maximum file size limit for EPUB uploads?
- [ ] Should chapter-by-chapter reading be mandatory or optional?
- [ ] Do we need DRM or copyright protection?
- [ ] Should reading progress sync across devices?

---

Last Updated: 2026-01-27
