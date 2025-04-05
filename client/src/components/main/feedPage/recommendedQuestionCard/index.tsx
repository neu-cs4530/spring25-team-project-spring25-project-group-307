import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
} from '@mui/material';
import { DatabaseTag, FeedItem } from '@fake-stack-overflow/shared';
import { ObjectId } from 'mongodb';

import { useEffect, useState } from 'react';
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

const RecommendedQuestionCard = ({
  item,
  onNavToCommunity,
  onNavToQuestion,
  onJoinLeaveCommunity,
}: {
  item: Omit<FeedItem, '_id'>;
  onNavToCommunity: (communityId: ObjectId) => void;
  onNavToQuestion: (questionId: ObjectId) => void;
  onJoinLeaveCommunity: (communityId: ObjectId, isJoined: boolean) => void;
}) => {
  const { user } = useUserContext();

  const [isAlreadyJoined, setIsAlreadyJoined] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hasInteractedWithInterests, setHasInteractedWithInterests] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [interestAction, setInterestAction] = useState<
    'interested' | 'not interested' | 'report' | null
  >(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);
  const menuOpen = Boolean(anchorEl);

  const viewQuestion = () => {
    onNavToQuestion(item.question._id);
  };

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
      const isMember =
        item.community.members.includes(user._id) ||
        item.community.moderators.includes(user._id) ||
        item.community.admins.includes(user._id);
      setIsAlreadyJoined(isMember);
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
      await joinCommunity(item.community.title, user.username);
      setIsAlreadyJoined(true);
      onJoinLeaveCommunity(item.community._id, true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error joining community:', error);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveCommunity(item.community.title, user.username);
      setIsAlreadyJoined(false);
      onJoinLeaveCommunity(item.community._id, false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error leaving community:', error);
    }
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleConfirmLeave = () => {
    handleLeave();
    handleCloseDialog();
  };

  const handleAction = (action: 'interested' | 'not interested' | 'report') => {
    handleMenuClose();
    if (action === 'interested' || action === 'not interested') {
      setHasInteractedWithInterests(true);
    } else if (action === 'report') {
      setHasReported(true);
    }
    setInterestAction(action);
    setSnackbarOpen(true);

    const timeout = setTimeout(() => {
      if (action === 'interested') {
        setInterestAction('interested');
        handleInterested();
      } else if (action === 'not interested') {
        setInterestAction('not interested');
        handleNotInterested();
      } else if (action === 'report') {
        setInterestAction('report');
        handleReport();
      }
      setSnackbarOpen(false);
    }, 3000);

    setUndoTimeout(timeout);
  };

  const handleUndo = () => {
    if (interestAction === 'interested' || interestAction === 'not interested') {
      setHasInteractedWithInterests(false);
    } else if (interestAction === 'report') {
      setHasReported(false);
    }
    if (undoTimeout) {
      clearTimeout(undoTimeout);
      setUndoTimeout(null);
    }
    setSnackbarOpen(false);
    setInterestAction(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const getSnackbarMessage = () => {
    if (interestAction === 'interested') {
      return 'You will see more questions like this.';
    }
    if (interestAction === 'not interested') {
      return 'You will see fewer questions like this.';
    }
    if (interestAction === 'report') {
      return 'This question has been reported.';
    }
    return '';
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
        }}>
        <Card
          onClick={event => {
            if (!isDialogOpen) {
              viewQuestion();
            }
          }}
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
                      onNavToCommunity(item.community._id);
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
                          handleOpenDialog();
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
                  <Dialog
                    open={isDialogOpen}
                    onClose={() => {
                      handleCloseDialog();
                    }}
                    aria-labelledby='confirm-leave-dialog-title'
                    aria-describedby='confirm-leave-dialog-description'>
                    <DialogTitle id='confirm-leave-dialog-title'>Confirm Leave</DialogTitle>
                    <DialogContent>
                      <DialogContentText id='confirm-leave-dialog-description'>
                        Are you sure you want to leave this community? This action cannot be undone.
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={event => {
                          event.stopPropagation();
                          handleCloseDialog();
                        }}
                        color='primary'>
                        Cancel
                      </Button>
                      <Button
                        onClick={event => {
                          event.stopPropagation();
                          handleConfirmLeave();
                        }}
                        color='error'
                        autoFocus>
                        Leave
                      </Button>
                    </DialogActions>
                  </Dialog>
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
                      handleAction('interested');
                    }}>
                    Interested
                  </MenuItem>
                )}
                {!hasInteractedWithInterests && (
                  <MenuItem
                    onClick={event => {
                      event.stopPropagation();
                      handleAction('not interested');
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
                      handleAction('report');
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
      <Snackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message={
          <span>
            {getSnackbarMessage()}
            <Button size='small' onClick={handleUndo} sx={{ ml: 1 }}>
              Undo
            </Button>
          </span>
        }
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default RecommendedQuestionCard;
