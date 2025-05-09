import { useState } from 'react';
import { ObjectId } from 'mongodb';
import { Box, Button, Typography } from '@mui/material';
import { Comment, DatabaseComment } from '../../../types/types';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';
import CommentItem from './commentItem';

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
  moderate?: boolean;
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
  moderate,
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
      commentByRank: user.ranking,
      commentDateTime: new Date(),
      upVotes: [],
      downVotes: [],
    };

    handleAddComment(newComment);
    setText('');
    setTextErr('');
  };

  return (
    <Box className='comment-section' sx={{ p: 1 }}>
      <Button size='small' onClick={() => setShowComments(!showComments)}>
        <Typography color='text-secondary'>
          {showComments ? 'Hide Comments' : 'Show Comments'}
        </Typography>
      </Button>

      {showComments && (
        <div className='comments-container'>
          <ul className='comments-list'>
            {comments.length > 0 ? (
              comments.map(comment => (
                <li key={comment._id.toString()}>
                  <CommentItem
                    comment={comment}
                    handleDeleteComment={handleDeleteComment}
                    currentRole={currentRole}
                    moderate={moderate}
                  />
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
              <Button variant='contained' onClick={handleAddCommentClick} sx={{ mb: 1 }}>
                Add Comment
              </Button>
            </div>
            {textErr && <small className='error'>{textErr}</small>}
          </div>
        </div>
      )}
    </Box>
  );
};

export default CommentSection;
