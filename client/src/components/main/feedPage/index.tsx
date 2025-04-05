import Box from '@mui/material/Box';

import CircularProgress from '@mui/material/CircularProgress';

import { Link, Typography, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ObjectId } from 'mongodb';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { FeedItem } from '@fake-stack-overflow/shared';
import RecommendedContentPanel from './recommendedContentPanel';
import useFeedPage from '../../../hooks/useFeedPage';
import useUserContext from '../../../hooks/useUserContext';

const FeedPage = () => {
  const { feedItems, setFeedItems, isQuestionsLoading, pageEndElement, noMoreContent, resetFeed } =
    useFeedPage();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const { user } = useUserContext();

  const handleNavigateToCommunity = (communityId: ObjectId) => {
    const rightMain = document.querySelector('.right_main') as HTMLElement;
    const scrollPosition = rightMain?.scrollTop || 0;
    const numFeedQuestionsBeforeNav = feedItems.length;

    navigate(`/community/${communityId}`, {
      state: { fromFeed: true, scrollPosition, numFeedQuestionsBeforeNav },
    });
  };

  const handleNavigateToQuestion = (questionId: ObjectId) => {
    const rightMain = document.querySelector('.right_main') as HTMLElement;
    const scrollPosition = rightMain?.scrollTop || 0;
    const numFeedQuestionsBeforeNav = feedItems.length;

    navigate(`/question/${questionId}`, {
      state: { fromFeed: true, scrollPosition, numFeedQuestionsBeforeNav },
    });
  };

  const handleJoinLeaveCommunity = (communityId: ObjectId, isJoined: boolean) => {
    const currentUser = user;
    setFeedItems((prev: FeedItem[]) =>
      prev.map(item => {
        if (item.community?._id.toString() === communityId.toString()) {
          const isInMembers = item.community.members.includes(currentUser._id);
          const isInModerators = item.community.moderators.includes(currentUser._id);
          const isInAdmins = item.community.admins.includes(currentUser._id);

          const updatedCommunity = { ...item.community };
          if (isJoined) {
            if (!isInMembers && !isInModerators && !isInAdmins) {
              updatedCommunity.members.push(currentUser._id);
            }
          } else {
            if (isInMembers) {
              updatedCommunity.members = updatedCommunity.members.filter(
                (member: ObjectId) => member.toString() !== currentUser._id.toString(),
              );
            }
            if (isInModerators) {
              updatedCommunity.moderators = updatedCommunity.moderators.filter(
                (moderator: ObjectId) => moderator.toString() !== currentUser._id.toString(),
              );
            }
            if (isInAdmins) {
              updatedCommunity.admins = updatedCommunity.admins.filter(
                (admin: ObjectId) => admin.toString() !== currentUser._id.toString(),
              );
            }
          }

          return {
            ...item,
            community: updatedCommunity,
          };
        }
        return item;
      }),
    );
  };

  useEffect(() => {
    if (location.state?.fromFeed && !isQuestionsLoading) {
      const savedScrollPosition = location.state.scrollPosition || 0;
      const rightMain = document.querySelector('.right_main') as HTMLElement;

      if (rightMain) {
        rightMain.scrollTo(0, savedScrollPosition);
      }

      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, isQuestionsLoading, navigate]);

  return (
    <>
      <RecommendedContentPanel
        feedItems={feedItems}
        onNavToCommunity={handleNavigateToCommunity}
        onNavToQuestion={handleNavigateToQuestion}
        onJoinLeaveCommunity={handleJoinLeaveCommunity}
      />
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <Box ref={pageEndElement} sx={{ width: '100%', p: 2 }}></Box>
        {noMoreContent && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              }}>
              <CheckCircleIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>

            {/* Text */}
            <Typography variant='h6' sx={{ mt: 2, fontWeight: 'bold' }}>
              {"You're All Caught Up"}
            </Typography>

            {/* Link */}
            <Link
              onClick={e => {
                e.preventDefault();
                resetFeed();
              }}
              sx={{ mt: 1, color: '#1877F2', fontSize: 14 }}>
              Refresh Feed
            </Link>
          </Box>
        )}
        {isQuestionsLoading && (
          <Box sx={{ p: 1 }} display='flex' justifyContent='center' alignItems='center'>
            <CircularProgress />
          </Box>
        )}
      </Box>
    </>
  );
};

export default FeedPage;
