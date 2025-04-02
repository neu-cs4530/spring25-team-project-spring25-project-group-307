import { useEffect, useState } from 'react';
import { ObjectId } from 'mongodb';
import { Box, Button, Card, CardContent, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatabaseComment, Comment } from '@fake-stack-overflow/shared';
import { getMetaData } from '../../../../tool';
import { addComment, getReplies } from '../../../../services/commentService';
import useUserContext from '../../../../hooks/useUserContext';

/**
 * Interface representing the props for the CommentItem component.
 * - comment - The comment object to be displayed.
 * - handleDeleteComment - A function to handle the deletion of a comment.
 * - currentRole - The role of the current user (e.g., 'ADMIN', 'MODERATOR, 'MEMBER').
 */
interface CommentItemProps {
  comment: DatabaseComment;
  handleDeleteComment: (commentId: ObjectId) => void;
  currentRole: string;
  moderate?: boolean;
}

const CommentItem = ({ comment, handleDeleteComment, currentRole, moderate }: CommentItemProps) => {
  const { user } = useUserContext();
  const [showReplies, setShowReplies] = useState<boolean>(false);
  const [replying, setReplying] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');
  const [replies, setReplies] = useState<DatabaseComment[]>([]);

  const handleShowRepliesClick = () => {
    setShowReplies(!showReplies);
  };

  const handleReplyClick = () => {
    setReplying(!replying);
  };

  const handleAddReply = async () => {
    const newReply: Comment = {
      text: replyText,
      commentBy: user.username,
      commentDateTime: new Date(),
    };

    const res = await addComment(comment._id.toString(), 'comment', newReply);
    if (res && 'error' in res) {
      // eslint-disable-next-line no-console
      console.error('Error adding reply:', res.error);
      return;
    }

    const updatedReplies = [...replies, res];
    setReplies(updatedReplies);
    setShowReplies(true);
    setReplyText('');
    setReplying(false);
  };

  const handleDeleteReply = (replyId: ObjectId) => {
    handleDeleteComment(replyId);
    setReplies(replies.filter(reply => reply._id !== replyId));
    setShowReplies(replies.length > 0);
  };

  useEffect(() => {
    const fetchReplies = async () => {
      await getReplies(comment._id.toString()).then(res => {
        if (res.replies) {
          setReplies(res.replies);
        }
      });
    };
    fetchReplies();
  }, [comment._id]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Card sx={{ mb: 1, width: '100%' }}>
          <CardContent>
            <Typography variant='body1' sx={{ mb: 1 }}>
              {comment.text}
            </Typography>
            <Typography variant='caption'>
              {comment.commentBy}, {getMetaData(new Date(comment.commentDateTime))}
            </Typography>
          </CardContent>
        </Card>
        {(currentRole === 'ADMIN' || currentRole === 'MODERATOR') && moderate ? (
          <IconButton sx={{ ml: 2 }} onClick={() => handleDeleteComment(comment._id)}>
            <DeleteIcon />
          </IconButton>
        ) : null}
      </Box>
      {replies && replies.length > 0 ? (
        <Button variant='text' onClick={handleShowRepliesClick} sx={{ mb: 1 }}>
          {showReplies ? 'Hide Replies' : `Show ${replies.length} Replies`}
        </Button>
      ) : null}
      <Button variant='text' sx={{ mb: 1 }} onClick={handleReplyClick}>
        {replying ? 'Cancel Reply' : 'Reply'}
      </Button>
      {replying ? (
        <Box sx={{ pl: 2, mb: 1 }}>
          <div className='input-row'>
            <textarea
              placeholder='Reply'
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              className='comment-textarea'
            />
            <button className='add-comment-button' onClick={handleAddReply}>
              Add Reply
            </button>
          </div>
        </Box>
      ) : null}
      {showReplies && replies.length > 0 ? (
        <Box sx={{ pl: 2 }}>
          {replies.map(reply => (
            <CommentItem
              key={reply._id.toString()}
              comment={reply}
              handleDeleteComment={handleDeleteReply}
              currentRole={currentRole}
              moderate={moderate}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export default CommentItem;
