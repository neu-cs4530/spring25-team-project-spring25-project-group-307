import { useCallback, useEffect, useState } from 'react';
import { ObjectId } from 'mongodb';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Typography,
  Tooltip,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatabaseComment, Comment } from '@fake-stack-overflow/shared';
import { getMetaData } from '../../../../tool';
import CommentVoteComponent from '../../voteCommentComponent';
import { addComment, getReplies } from '../../../../services/commentService';
import useUserContext from '../../../../hooks/useUserContext';
import { getUserByUsername } from '../../../../services/userService';

/**
 * Interface representing the props for the CommentItem component.
 */
interface CommentItemProps {
  comment: DatabaseComment;
  handleDeleteComment: (commentId: ObjectId) => void;
  currentRole: string;
  moderate?: boolean;
}

const CommentItem = ({ comment, handleDeleteComment, currentRole, moderate }: CommentItemProps) => {
  const { user } = useUserContext();
  const [showReplies, setShowReplies] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<DatabaseComment[]>([]);
  const [commentByRank, setCommentByRank] = useState(comment.commentByRank ?? null);

  const fetchRepliesWithRanks = useCallback(async () => {
    const res = await getReplies(comment._id.toString());
    const rankedReplies = await Promise.all(
      (res.replies || []).map(async reply => {
        const replyUser = await getUserByUsername(reply.commentBy);
        return {
          ...reply,
          commentByRank: replyUser?.ranking ?? null,
        };
      }),
    );
    setReplies(rankedReplies);
  }, [comment._id]);

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
      commentByRank: user.ranking,
      commentDateTime: new Date(),
      upVotes: [],
      downVotes: [],
    };

    const res = await addComment(comment._id.toString(), 'comment', newReply);
    if ('error' in res) return;

    // Refresh replies and re-fetch rank of the parent comment
    await fetchRepliesWithRanks();
    const updatedParentUser = await getUserByUsername(comment.commentBy);
    setCommentByRank(updatedParentUser?.ranking ?? null);

    setShowReplies(true);
    setReplyText('');
    setReplying(false);
  };

  const handleDeleteReply = (replyId: ObjectId) => {
    handleDeleteComment(replyId);
    setReplies(prev => prev.filter(reply => reply._id !== replyId));
    setShowReplies(replies.length > 1); // after removal
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchRepliesWithRanks();
      if (!comment.commentByRank) {
        const userDoc = await getUserByUsername(comment.commentBy);
        setCommentByRank(userDoc?.ranking ?? null);
      }
    };
    initialize();
  }, [comment._id, comment.commentBy, comment.commentByRank, fetchRepliesWithRanks]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Card sx={{ mb: 1, width: '100%' }}>
          <CardContent>
            <Typography variant='body1' sx={{ mb: 1 }}>
              {comment.text}
            </Typography>
            <Box display='flex' alignItems='center' gap={1} sx={{ flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant='caption' fontWeight={500}>
                {comment.commentBy}
              </Typography>
              {commentByRank && (
                <Tooltip title='User Rank' arrow>
                  <Chip
                    label={commentByRank}
                    size='small'
                    variant='outlined'
                    color='primary'
                    sx={{ fontSize: '0.65rem', fontWeight: 500 }}
                  />
                </Tooltip>
              )}
              <Typography variant='caption' color='text.secondary'>
                {getMetaData(new Date(comment.commentDateTime))}
              </Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <CommentVoteComponent comment={comment} />
            </Box>
          </CardContent>
        </Card>
        {(currentRole === 'ADMIN' || currentRole === 'MODERATOR') && moderate && (
          <IconButton sx={{ ml: 2 }} onClick={() => handleDeleteComment(comment._id)}>
            <DeleteIcon />
          </IconButton>
        )}
      </Box>

      {replies.length > 0 && (
        <Button variant='text' onClick={handleShowRepliesClick} sx={{ mb: 1 }}>
          {showReplies ? 'Hide Replies' : `Show ${replies.length} Replies`}
        </Button>
      )}

      <Button variant='text' sx={{ mb: 1 }} onClick={handleReplyClick}>
        {replying ? 'Cancel Reply' : 'Reply'}
      </Button>

      {replying && (
        <Box sx={{ pl: 2, mb: 1 }}>
          <div className='input-row'>
            <textarea
              placeholder='Reply'
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              className='comment-textarea'
            />
            <Button variant='contained' onClick={handleAddReply} sx={{ mb: 1 }}>
              Add Reply
            </Button>
          </div>
        </Box>
      )}

      {showReplies && replies.length > 0 && (
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
      )}
    </Box>
  );
};

export default CommentItem;
