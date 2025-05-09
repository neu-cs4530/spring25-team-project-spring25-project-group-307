import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './layout';
import Login from './auth/login';
import { FakeSOSocket, SafeDatabaseUser } from '../types/types';
import LoginContext from '../contexts/LoginContext';
import UserContext from '../contexts/UserContext';
import QuestionPage from './main/questionPage';
import TagPage from './main/tagPage';
import NewQuestionPage from './main/newQuestion';
import NewAnswerPage from './main/newAnswer';
import AnswerPage from './main/answerPage';
import MessagingPage from './main/messagingPage';
import DirectMessage from './main/directMessage';
import Signup from './auth/signup';
import UsersListPage from './main/usersListPage';
import ProfileSettings from './profileSettings';
import AllGamesPage from './main/games/allGamesPage';
import GamePage from './main/games/gamePage';
import LeaderboardPage from './main/leaderboardPage';
import CommunityPage from './main/communityListPage';
import NewCommunityPage from './main/newCommunity';
import FeedPage from './main/feedPage';
import ViewCommunityPage from './main/viewCommunityPage';
import NewCommunityQuestion from './main/newCommunityQuestion';
import StatisticsPage from './statistics';
import SavedPage from './main/savedPage';

const ProtectedRoute = ({
  user,
  socket,
  children,
}: {
  user: SafeDatabaseUser | null;
  socket: FakeSOSocket | null;
  children: JSX.Element;
}) => {
  if (!user || !socket) {
    return <Navigate to='/' />;
  }

  return <UserContext.Provider value={{ user, socket }}>{children}</UserContext.Provider>;
};

/**
 * Represents the main component of the application.
 * It manages the state for search terms and the main title.
 */
const FakeStackOverflow = ({ socket }: { socket: FakeSOSocket | null }) => {
  const [user, setSafeDatabaseUser] = useState<SafeDatabaseUser | null>(null);
  const setUser = (safeDatabaseUser: SafeDatabaseUser | null) => {
    if (socket && safeDatabaseUser) {
      setSafeDatabaseUser(safeDatabaseUser);
      socket.emit('loginUser', safeDatabaseUser.username);
    }
  };
  // in case of disconnect
  useEffect(() => {
    if (user && socket) {
      socket.on('connect', () => {
        socket.emit('loginUser', user.username);
      });
    }
  }, [socket, user]);

  return (
    <LoginContext.Provider value={{ setUser }}>
      <Routes>
        {/* Public Route */}
        <Route path='/' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        {/* Protected Routes */}
        {
          <Route
            element={
              <ProtectedRoute user={user} socket={socket}>
                <Layout />
              </ProtectedRoute>
            }>
            <Route path='/home' element={<QuestionPage />} />
            <Route path='tags' element={<TagPage />} />
            <Route path='/messaging' element={<MessagingPage />} />
            <Route path='/messaging/direct-message' element={<DirectMessage />} />
            <Route path='/question/:qid' element={<AnswerPage />} />
            <Route path='/new/question' element={<NewQuestionPage />} />
            <Route path='/new/answer/:qid' element={<NewAnswerPage />} />
            <Route
              path='/users'
              element={
                <Box sx={{ mx: 10, my: 4 }}>
                  <UsersListPage />
                </Box>
              }
            />
            <Route path='/user/:username' element={<ProfileSettings />} />
            <Route path='/games' element={<AllGamesPage />} />
            <Route path='/games/:gameID' element={<GamePage />} />
            <Route path='/leaderboard' element={<LeaderboardPage />} />
            <Route path='/communities' element={<CommunityPage />} />
            <Route path='/community/:cid' element={<ViewCommunityPage />} />
            <Route path='/new/community' element={<NewCommunityPage />} />
            <Route path='/new/question/:cid' element={<NewCommunityQuestion />} />
            <Route path='/statistics/:username' element={<StatisticsPage />} />
            <Route path='/feed' element={<FeedPage />} />
            <Route path='/saved' element={<SavedPage />} />
          </Route>
        }
      </Routes>
    </LoginContext.Provider>
  );
};

export default FakeStackOverflow;
