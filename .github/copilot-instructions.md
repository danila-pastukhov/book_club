# Book Club AI Guide

## Architecture & Domain
- Backend is a Django 5 + DRF API in [backend/bookapp](backend/bookapp) with a custom user model and Postgres settings in [backend/book_api/settings.py](backend/book_api/settings.py); keep AUTH_USER_MODEL references intact when adding auth features.
- Frontend is a Vite + React 18 SPA in [frontend/src](frontend/src) that leans on Tailwind (see [frontend/tailwind.config.js](frontend/tailwind.config.js)) and TanStack Query for data fetching.
- EPUB ingestion: uploads hit [backend/bookapp/views.py](backend/bookapp/views.py) `create_book`/`update_book`, are validated by `validate_epub_file_complete`, parsed via [backend/bookapp/epub_handler.py](backend/bookapp/epub_handler.py), and stored under `media/epub_files`; breaking this pipeline prevents the React reader from loading.
- Non-EPUB titles fall back to the manual pager in [frontend/src/pages/BookPagesPage.jsx](frontend/src/pages/BookPagesPage.jsx), so always set `content_type` accurately on `Book` records.

## API Surface & Data Flow
- Function-based DRF endpoints live in [backend/bookapp/views.py](backend/bookapp/views.py) and are wired in [backend/bookapp/urls.py](backend/bookapp/urls.py); whenever you add an endpoint, also expose it via the axios layer in [frontend/src/services/apiBook.js](frontend/src/services/apiBook.js).
- Serialization follows [backend/bookapp/serializers.py](backend/bookapp/serializers.py); reuse `SimpleAuthorSerializer`, `ReadingGroupSerializer`, etc., instead of hand-rolling nested payloads to keep responses consistent with the UI expectations.
- Book comments blend CFI metadata with text: `BookComment` in [backend/bookapp/models.py](backend/bookapp/models.py) enforces `cfi_range` and `selected_text`, and access control checks in `get_book_comments`/`create_book_comment` ensure only confirmed group members (via `UserToReadingGroupState`) can read or write group discussions.
- Notifications, reading groups, and membership flows all pivot around the `UserToReadingGroupState` through model; when changing membership logic, update both the serializer and the guard clauses in the corresponding views.

## Frontend Conventions
- React Query keys are namespaced tuples like `['book', slug]` or `['bookComments', slug, commentType, readingGroupId]`; cache invalidation assumes this shape, so follow it when adding queries/mutations (see [frontend/src/hooks/useBookComments.js](frontend/src/hooks/useBookComments.js)).
- API calls must go through the shared axios instance in [frontend/src/api.js](frontend/src/api.js) so the JWT interceptor can append `Authorization` while checking expiry; no ad-hoc `fetch` calls.
- Routes are declared in [frontend/src/App.jsx](frontend/src/App.jsx) and wrapped by `QueryClientProvider` in [frontend/src/main.jsx](frontend/src/main.jsx); guard authenticated pages with `ProtectedRoute` in [frontend/src/ui_components/ProtectedRoute.jsx](frontend/src/ui_components/ProtectedRoute.jsx).
- The EPUB reader stack combines `useEpubReader`, `useTextSelection`, `useHighlights`, and `useBookComments` (see [frontend/src/pages/EpubReaderPage.jsx](frontend/src/pages/EpubReaderPage.jsx)); new reader features should plug into these hooks rather than duplicating event handling.

## Environment & Tooling
- Backend env vars are loaded with `python-decouple` (`SECRET_KEY`, `DB_*`, `LOG_*`); create a `.env` alongside [backend/manage.py](backend/manage.py) or configure host-level vars before running `python manage.py runserver`.
- Use `pip install -r backend/requirements.txt` and `python backend/manage.py migrate`; deployment uses [backend/build.sh](backend/build.sh) which installs deps, collects static files, and runs migrations—update it if you add new predeploy steps.
- Frontend dev server runs on port 5174 per [frontend/vite.config.js](frontend/vite.config.js); the Django CORS list already whitelists 5173-5175, so stick to those ports unless you update both files.
- REST calls assume `VITE_BASE_URL` (general API host) and `VITE_API_BASE_URL` (used for serving media/EPUB files in [frontend/src/pages/EpubReaderPage.jsx](frontend/src/pages/EpubReaderPage.jsx)); document any additional vars in the README when you introduce them.

## Working With Text Selections & Highlights
- `useTextSelection` listens to `rendition.on('selected')` to capture the EPUB CFI range and screen coordinates before showing the floating `CommentButton`; avoid direct DOM listeners in components that already consume this hook.
- `useHighlights` filters comment CFIs to the currently displayed spine section before calling `rendition.annotations.highlight`, which keeps performance manageable—if you change how CFIs are stored, update this logic concurrently.
- Posting a comment requires the hook chain `useTextSelection -> useBookComments -> createBookComment` so that `selected_text` and `cfi_range` reach the backend; never call `createBookComment` without both fields.

## Testing & Debugging Tips
- Many hooks log extra info in `import.meta.env.DEV`; keep these guards whenever you add diagnostics so production bundles stay quiet.
- When debugging EPUB parsing, run `python backend/manage.py shell` and import `parse_epub_file` to reproduce the same code paths the upload views use.
- React Query makes it easy to inspect cached data; enable the devtools locally if you need to watch cache invalidation while hacking on commenting or reader UI flows.
