import React, { useEffect, useState } from 'react';
import { ObjectId } from 'mongodb';
import { Box, IconButton, Typography, Chip, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AnswerVoteComponent from '../../answerVoteComponent';
import { handleHyperlink } from '../../../../tool';
import CommentSection from '../../commentSection';
import './index.css';
import { Comment, DatabaseComment, PopulatedDatabaseAnswer } from '../../../../types/types';

interface AnswerProps {
  text: string;
  ansBy: string;
  meta: string;
  comments: DatabaseComment[];
  handleAddComment: (comment: Comment) => void;
  handleDeleteComment: (commentId: ObjectId) => void;
  handleDeleteAnswer: () => void;
  currentRole: string;
  moderate?: boolean;
  answer: PopulatedDatabaseAnswer;
}

const AnswerView = ({
  text,
  ansBy,
  meta,
  comments,
  handleAddComment,
  handleDeleteComment,
  handleDeleteAnswer,
  currentRole,
  moderate,
  answer,
}: AnswerProps) => {
  const [commentList, setCommentList] = useState(comments);

  useEffect(() => {
    setCommentList(comments);
  }, [comments]);

  const onDeleteComment = async (commentId: ObjectId) => {
    try {
      await handleDeleteComment(commentId);
      const updatedComments = commentList.filter(comment => comment._id !== commentId);
      setCommentList(updatedComments);
    } catch (error) {
      // handle error
    }
  };

  return (
    <Box className='answer' sx={{ borderTop: '1px dashed #ccc', pt: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <AnswerVoteComponent answer={answer} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography id='answerText' className='answerText' sx={{ mb: 1 }}>
            {handleHyperlink(text)}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
              mt: 1,
              mb: 1,
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography fontWeight={500} color='text.primary'>
                {ansBy}
              </Typography>
              {answer.ansByRank && (
                <Tooltip title='User Rank' arrow>
                  <Chip
                    label={answer.ansByRank}
                    size='small'
                    variant='outlined'
                    color='primary'
                    sx={{ fontSize: '0.7rem', fontWeight: 500 }}
                  />
                </Tooltip>
              )}
              <Typography variant='body2' color='text.secondary'>
                • {meta}
              </Typography>
            </Box>

            {(currentRole === 'ADMIN' || currentRole === 'MODERATOR') && moderate && (
              <IconButton onClick={handleDeleteAnswer} size='small' sx={{ mr: 1 }}>
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          <CommentSection
            comments={commentList}
            handleAddComment={handleAddComment}
            handleDeleteComment={onDeleteComment}
            currentRole={currentRole}
            moderate={moderate}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AnswerView;
