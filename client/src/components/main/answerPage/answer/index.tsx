import React, { useEffect, useState } from 'react';
import { ObjectId } from 'mongodb';
import { Box, IconButton } from '@mui/material';
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
      // catch error
    }
  };

  return (
    <div className='answer'>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <AnswerVoteComponent answer={answer} />
        <Box>
          <div id='answerText' className='answerText'>
            {handleHyperlink(text)}
          </div>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className='answerAuthor'>
              <div className='answer_author'>{ansBy}</div>
              <div className='answer_question_meta'>{meta}</div>
            </div>
            {(currentRole === 'ADMIN' || currentRole === 'MODERATOR') && (
              <IconButton onClick={handleDeleteAnswer}>
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
    </div>
  );
};

export default AnswerView;
