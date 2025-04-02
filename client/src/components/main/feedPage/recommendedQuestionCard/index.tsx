import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { DatabaseTag, FeedItem } from '@fake-stack-overflow/shared';
import { useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import useUserContext from '../../../../hooks/useUserContext';
import { joinCommunity, leaveCommunity } from '../../../../services/communityService';
import { updateInterestsWeights } from '../../../../services/interestService';
import {
  addSavedQuestion,
  getUserByUsername,
  removeSavedQuestion,
} from '../../../../services/userService';
import { addReportToQuestion } from '../../../../services/questionService';

const RecommendedQuestionCard = ({ item }: { item: Omit<FeedItem, '_id'> }) => {
  const navigate = useNavigate();
  const viewQuestion = () => {
    if ('_id' in item.question) {
      navigate(`/question/${item.question._id}`);
    }
  };
  const { user } = useUserContext();

  const [isAlreadyJoined, setIsAlreadyJoined] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hasInteractedWithInterests, setHasInteractedWithInterests] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleInterested = async () => {
    await updateInterestsWeights(
      user._id,
      item.question.tags.map((tag: DatabaseTag) => tag._id),
      true,
    );
    setHasInteractedWithInterests(true);
    handleMenuClose();
  };

  const handleNotInterested = async () => {
    await updateInterestsWeights(
      user._id,
      item.question.tags.map((tag: DatabaseTag) => tag._id),
      false,
    );
    setHasInteractedWithInterests(true);
    handleMenuClose();
  };

  const handleSave = async () => {
    await addSavedQuestion(user.username, item.question._id);
    setIsSaved(true);
    handleMenuClose();
  };

  const handleUnsave = async () => {
    await removeSavedQuestion(user.username, item.question._id);
    setIsSaved(false);
    handleMenuClose();
  };

  const handleReport = async () => {
    await addReportToQuestion(item.question._id.toString(), user.username);
    handleMenuClose();
  };

  useEffect(() => {
    if (item.community) {
      setIsAlreadyJoined(item.community.members.includes(user._id));
    }
  }, [item.community, user._id]);

  useEffect(() => {
    if (item.question.reportedBy.includes(user._id)) {
      setHasReported(true);
    }
  }, [item.question.reportedBy, user._id]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserByUsername(user.username);
        setIsSaved(
          data.savedQuestions.some(
            savedQuestionId => savedQuestionId.toString() === item.question._id.toString(),
          ),
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [item.question._id, user.username]);

  const handleJoin = async () => {
    try {
      if (item.community) {
        await joinCommunity(item.community.title, user.username);
        setIsAlreadyJoined(true);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error joining community:', error);
    }
  };

  const handleLeave = async () => {
    try {
      if (item.community) {
        await leaveCommunity(item.community.title, user.username);
        setIsAlreadyJoined(false);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error leaving community:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}>
      <Card
        onClick={viewQuestion}
        sx={{
          'minWidth': 275,
          'width': '50%',
          'p': 2,
          'border': '1px dashed grey',
          'cursor': 'pointer',
          'transition': 'background-color 0.3s ease',
          '&:hover': { backgroundColor: '#f5f5f5' },
        }}>
        <CardContent>
          {/* Header Section */}
          {item.community && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid lightgrey',
              }}>
              {/* Community Title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant='subtitle1' fontWeight='bold'>
                  {item.community.title}
                </Typography>
              </Box>
              {/* Buttons Group */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  onClick={event => {
                    event.stopPropagation();
                    navigate(`/community/${item.community._id}`);
                  }}
                  variant='contained'
                  size='small'
                  sx={{ borderRadius: 20 }}
                  disabled={item.community.isPrivate}>
                  View
                </Button>
                <Button
                  onClick={event => {
                    event.stopPropagation();
                    if (item.community) {
                      if (isAlreadyJoined) {
                        handleLeave();
                      } else {
                        handleJoin();
                      }
                    }
                  }}
                  variant='contained'
                  size='small'
                  sx={{
                    'borderRadius': 20,
                    'backgroundColor': isAlreadyJoined ? 'error.main' : 'primary.main',
                    '&:hover': {
                      backgroundColor: isAlreadyJoined ? 'error.dark' : 'primary.dark',
                    },
                  }}>
                  {isAlreadyJoined ? 'Leave' : 'Join'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Card Content */}
          <Typography sx={{ mt: 1.5 }} variant='h5' component='div'>
            {item.question.title}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            {item.question.askDateTime.toLocaleString()}
          </Typography>
          <Typography variant='body2'>
            {item.question.text}
            <br />
          </Typography>
        </CardContent>
        <CardActions>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between', // Push "View Post" to the left and menu icon to the right
              alignItems: 'center',
              width: '100%', // Ensure the Box spans the full width of the card
            }}>
            {/* "View Post" Button */}
            <Button size='small'>View Post</Button>

            {/* 3-Dot Menu Icon */}
            <IconButton
              onClick={event => {
                event.stopPropagation();
                handleMenuOpen(event);
              }}>
              <MoreHorizIcon />
            </IconButton>
            {/* Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={(event: React.MouseEvent<HTMLElement>) => {
                event.stopPropagation();
                handleMenuClose();
              }}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
              {!hasInteractedWithInterests && (
                <MenuItem
                  onClick={event => {
                    event.stopPropagation();
                    handleInterested();
                  }}>
                  Interested
                </MenuItem>
              )}
              {!hasInteractedWithInterests && (
                <MenuItem
                  onClick={event => {
                    event.stopPropagation();
                    handleNotInterested();
                  }}>
                  Not Interested
                </MenuItem>
              )}
              {isSaved ? (
                <MenuItem
                  onClick={event => {
                    event.stopPropagation();
                    handleUnsave();
                  }}>
                  Unsave
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={event => {
                    event.stopPropagation();
                    handleSave();
                  }}>
                  Save
                </MenuItem>
              )}
              {!hasReported && (
                <MenuItem
                  onClick={event => {
                    event.stopPropagation();
                    handleReport();
                  }}>
                  Report
                </MenuItem>
              )}
            </Menu>
          </Box>
        </CardActions>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {item.question.tags.map((tag: DatabaseTag) => (
            <Box
              key={tag._id.toString()}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#ebedef',
                borderRadius: '20px',
                px: 2,
                py: 0.5,
                width: 'auto',
              }}>
              <Typography variant='body2'>{tag.name}</Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
};

export default RecommendedQuestionCard;
