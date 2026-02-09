import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './ui_components/AppLayout'
import AppLayout2 from './ui_components/AppLayout2'
import HomePage from './pages/HomePage'
import DetailPage from './pages/DetailPage'
import ReadingGroupPage from './pages/ReadingGroupPage'
import SignupPage from './pages/SignupPage'
import CreateBookPage from './pages/CreateBookPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './ui_components/ProtectedRoute'
import ProfilePage from './pages/ProfilePage'
import BookPagesPage from './pages/BookPagesPage'
import AllReadingGroupsPage from './pages/AllReadingGroupsPage'
import AllBooksPage from './pages/AllBooksPage'
import CreateReadingGroupPage from './pages/CreateReadingGroupPage'
import NotificationsPage from './pages/NotificationsPage'
import QuestsPage from './pages/QuestsPage'
import GroupQuestsPage from './pages/GroupQuestsPage'
import CreateQuestPage from './pages/CreateQuestPage'
import PrizeBoardPage from './pages/PrizeBoardPage'
import UserPrizeBoardPage from './pages/UserPrizeBoardPage'
import RewardsPage from './pages/RewardsPage'
import NotFoundPage from './pages/NotFoundPage'

const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<AppLayout />}
        >
          <Route index element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route
            path="profile/:username"
            element={<ProfilePage />}
          />
          <Route
            path="profile/:username/board"
            element={
              <ProtectedRoute>
                <UserPrizeBoardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="books/:slug"
            element={<DetailPage />}
          />
          <Route
            path="groups/:slug"
            element={
              <ProtectedRoute>
                <ReadingGroupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="groups"
            element={<AllReadingGroupsPage />}
          />
          <Route
            path="books"
            element={<AllBooksPage />}
          />
          <Route
            path="notifications"
            element={<NotificationsPage />}
          />
          <Route
            path="quests"
            element={
              <ProtectedRoute>
                <QuestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="quests/create"
            element={
              <ProtectedRoute>
                <CreateQuestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="groups/:slug/quests"
            element={
              <ProtectedRoute>
                <GroupQuestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="rewards"
            element={
              <ProtectedRoute>
                <RewardsPage />
              </ProtectedRoute>
            }
          />
          <Route path="signup" element={<SignupPage />} />
          <Route
            path="create_book"
            element={
              <ProtectedRoute>
                <CreateBookPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="create_group"
            element={
              <ProtectedRoute>
                <CreateReadingGroupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="groups/:slug/board"
            element={
              <ProtectedRoute>
                <PrizeBoardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="signin"
            element={<LoginPage />}
          />
        </Route>
        <Route
          path="/books/:slug/page"
          //element={<AppLayout2 />}
        >
          <Route index element={<BookPagesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
