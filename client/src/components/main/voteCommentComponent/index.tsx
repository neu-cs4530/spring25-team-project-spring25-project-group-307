import { downvoteComment, upvoteComment } from '../../../services/commentService';
import useUserContext from '../../../hooks/useUserContext';
import { DatabaseComment } from '../../../types/types';
import './index.css';
import useCommentVoteStatus from '../../../hooks/useCommentVoteStatus';
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

  /**
   * Handles voting logic for a comment.
   *
   * @param type - The type of vote: 'upvote' or 'downvote'.
   */
  const handleVote = async (type: 'upvote' | 'downvote') => {
    try {
      if (comment._id) {
        if (type === 'upvote') {
          await upvoteComment(comment._id, user.username);
        } else {
          await downvoteComment(comment._id, user.username);
        }
      }
    } catch (err) {
      // catch error
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

export default CommentVoteComponent;
