import { downvoteAnswer, upvoteAnswer } from '../../../services/answerService';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';
import { PopulatedDatabaseAnswer } from '../../../types/types';
import useAnswerVoteStatus from '../../../hooks/useAnswerVoteStatus';

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

  /**
   * Function to handle upvoting or downvoting an answer.
   *
   * @param type - The type of vote, either 'upvote' or 'downvote'.
   */
  const handleVote = async (type: string) => {
    try {
      if (answer._id) {
        if (type === 'upvote') {
          await upvoteAnswer(answer._id, user.username);
        } else if (type === 'downvote') {
          await downvoteAnswer(answer._id, user.username);
        }
      }
    } catch (error) {
      // Handle error if needed
    }
  };

  return (
    <div className='vote-container'>
      <button
        className={`vote-button ${voted === 1 ? 'vote-button-upvoted' : ''}`}
        onClick={() => handleVote('upvote')}>
        Upvote
      </button>
      <button
        className={`vote-button ${voted === -1 ? 'vote-button-downvoted' : ''}`}
        onClick={() => handleVote('downvote')}>
        Downvote
      </button>
      <span className='vote-count'>{count}</span>
    </div>
  );
};

export default AnswerVoteComponent;
