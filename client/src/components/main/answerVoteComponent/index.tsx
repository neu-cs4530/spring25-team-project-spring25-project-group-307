import { IconButton, Stack, Typography } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { downvoteAnswer, upvoteAnswer } from '../../../services/answerService';
import useUserContext from '../../../hooks/useUserContext';
import { PopulatedDatabaseAnswer } from '../../../types/types';
import useAnswerVoteStatus from '../../../hooks/useAnswerVoteStatus';
import { useAchievement } from '../../../contexts/AchievementContext';

/**
 * Interface represents the props for the AnswerVoteComponent.
 *
 * answer - The answer object containing voting information.
 */
interface AnswerVoteComponentProps {
  answer: PopulatedDatabaseAnswer;
}

/**
 * A Vote component that allows users to upvote or downvote an answer.
 *
 * @param answer - The answer object containing voting information.
 */
const AnswerVoteComponent = ({ answer }: AnswerVoteComponentProps) => {
  const { user } = useUserContext();
  const { count, voted } = useAnswerVoteStatus({ answer });
  const { triggerAchievement } = useAchievement();

  /**
   * Function to handle upvoting or downvoting an answer.
   *
   * @param type - The type of vote, either 'upvote' or 'downvote'.
   */
  const handleVote = async (type: string) => {
    try {
      if (answer._id) {
        let response;
        if (type === 'upvote') {
          response = await upvoteAnswer(answer._id, user.username);
        } else if (type === 'downvote') {
          response = await downvoteAnswer(answer._id, user.username);
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

export default AnswerVoteComponent;
