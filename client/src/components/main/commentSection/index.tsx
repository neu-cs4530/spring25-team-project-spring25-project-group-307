import { useState } from 'react';
import { ObjectId } from 'mongodb';
import { Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getMetaData } from '../../../tool';
import { Comment, DatabaseComment } from '../../../types/types';
import './index.css';
import CommentVoteComponent from '../voteCommentComponent';
import useUserContext from '../../../hooks/useUserContext';

/**
 * Interface representing the props for the Comment Section component.
 *
 * - comments - list of the comment components
 * - handleAddComment - a function that handles adding a new comment, taking a Comment object as an argument
 */
interface CommentSectionProps {
  comments: DatabaseComment[];
  handleAddComment: (comment: Comment) => void;
  handleDeleteComment: (commentId: ObjectId) => void;
  currentRole: string;
}

/**
 * CommentSection component shows the users all the comments and allows the users add more comments.
 *
 * @param comments: an array of Comment objects
 * @param handleAddComment: function to handle the addition of a new comment
 */
const CommentSection = ({
  comments,
  handleAddComment,
  handleDeleteComment,
  currentRole,
}: CommentSectionProps) => {
  const { user } = useUserContext();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [showComments, setShowComments] = useState<boolean>(false);

  /**
   * Function to handle the addition of a new comment.
   */
  const handleAddCommentClick = () => {
    if (text.trim() === '' || user.username.trim() === '') {
      setTextErr(text.trim() === '' ? 'Comment text cannot be empty' : '');
      return;
    }

    const newComment: Comment = {
      text,
      commentBy: user.username,
      commentDateTime: new Date(),
      upVotes: [],
      downVotes: [],
    };

    handleAddComment(newComment);
    setText('');
    setTextErr('');
  };

  return (
    <div className='comment-section'>
      <button className='toggle-button' onClick={() => setShowComments(!showComments)}>
        {showComments ? 'Hide Comments' : 'Show Comments'}
      </button>

      {showComments && (
        <div className='comments-container'>
          <ul className='comments-list'>
            {comments.length > 0 ? (
              comments.map(comment => (
                <li key={comment._id.toString()} className='comment-item'>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p className='comment-text'>{comment.text}</p>
                      <small className='comment-meta'>
                        {comment.commentBy}, {getMetaData(new Date(comment.commentDateTime))}
                      </small>
                      <CommentVoteComponent comment={comment} />
                    </div>
                    {currentRole === 'ADMIN' || currentRole === 'MODERATOR' ? (
                      <IconButton sx={{ ml: 2 }} onClick={() => handleDeleteComment(comment._id)}>
                        <DeleteIcon />
                      </IconButton>
                    ) : null}
                  </Box>
                </li>
              ))
            ) : (
              <p className='no-comments'>No comments yet.</p>
            )}
          </ul>

          <div className='add-comment'>
            <div className='input-row'>
              <textarea
                placeholder='Comment'
                value={text}
                onChange={e => setText(e.target.value)}
                className='comment-textarea'
              />
              <button className='add-comment-button' onClick={handleAddCommentClick}>
                Add Comment
              </button>
            </div>
            {textErr && <small className='error'>{textErr}</small>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
