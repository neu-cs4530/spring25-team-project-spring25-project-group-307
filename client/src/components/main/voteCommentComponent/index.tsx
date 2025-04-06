import { IconButton, Stack, Typography } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { downvoteComment, upvoteComment } from '../../../services/commentService';
import useUserContext from '../../../hooks/useUserContext';
import { DatabaseComment } from '../../../types/types';
import useCommentVoteStatus from '../../../hooks/useCommentVoteStatus';
import { useAchievement } from '../../../contexts/AchievementContext';

/**
 * Props interface for CommentVoteComponent
 */
interface CommentVoteComponentProps {
  comment: DatabaseComment;
}

/**
 * Component for handling upvotes and downvotes on comments.
 *
 * @param comment - The comment to be voted on.
 */
const CommentVoteComponent = ({ comment }: CommentVoteComponentProps) => {
  const { user } = useUserContext();
  const { count, voted } = useCommentVoteStatus({ comment });
  const { triggerAchievement } = useAchievement();

  /**
   * Handles voting logic for a comment.
   *
   * @param type - The type of vote: 'upvote' or 'downvote'.
   */
  const handleVote = async (type: 'upvote' | 'downvote') => {
    try {
      if (comment._id) {
        let response;
        if (type === 'upvote') {
          response = await upvoteComment(comment._id, user.username);
        } else {
          response = await downvoteComment(comment._id, user.username);
        }
        response?.unlockedAchievements?.forEach(triggerAchievement);
      }
    } catch (err) {
      // Handle error
    }
  };

  return (
    <Stack direction='row' alignItems='center' spacing={1}>
      {/* Upvote Button */}
      <IconButton
        onClick={() => handleVote('upvote')}
        color={voted === 1 ? 'primary' : 'default'}
        sx={{
          'transition': '0.3s',
          '&:hover': { color: 'primary.main' },
        }}>
        <ThumbUpIcon fontSize='small' />
      </IconButton>

      {/* Vote Count */}
      <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
        {count}
      </Typography>

      {/* Downvote Button */}
      <IconButton
        onClick={() => handleVote('downvote')}
        color={voted === -1 ? 'error' : 'default'}
        sx={{
          'transition': '0.3s',
          '&:hover': { color: 'error.main' },
        }}>
        <ThumbDownIcon fontSize='small' />
      </IconButton>
    </Stack>
  );
};

export default CommentVoteComponent;
