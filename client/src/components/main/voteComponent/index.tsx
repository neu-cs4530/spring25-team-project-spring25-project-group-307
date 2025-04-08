import { IconButton, Stack, Typography } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { downvoteQuestion, upvoteQuestion } from '../../../services/questionService';
import useUserContext from '../../../hooks/useUserContext';
import { PopulatedDatabaseQuestion } from '../../../types/types';
import useVoteStatus from '../../../hooks/useVoteStatus';
import { useAchievement } from '../../../contexts/AchievementContext';
/**
 * Interface represents the props for the VoteComponent.
 *
 * question - The question object containing voting information.
 */
interface VoteComponentProps {
  question: PopulatedDatabaseQuestion;
}

/**
 * A Vote component that allows users to upvote or downvote a question.
 *
 * @param question - The question object containing voting information.
 */
const VoteComponent = ({ question }: VoteComponentProps) => {
  const { user } = useUserContext();
  const { count, voted } = useVoteStatus({ question });
  const { triggerAchievement } = useAchievement();

  /**
   * Function to handle upvoting or downvoting a question.
   *
   * @param type - The type of vote, either 'upvote' or 'downvote'.
   */
  const handleVote = async (type: string) => {
    try {
      if (question._id) {
        let response;
        if (type === 'upvote') {
          response = await upvoteQuestion(question._id, user.username);
        } else if (type === 'downvote') {
          response = await downvoteQuestion(question._id, user.username);
        }
        response?.unlockedAchievements?.forEach(triggerAchievement);
      }
    } catch (error) {
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
        <ThumbUpIcon />
      </IconButton>

      {/* Vote Count */}
      <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
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
        <ThumbDownIcon />
      </IconButton>
    </Stack>
  );
};

export default VoteComponent;
