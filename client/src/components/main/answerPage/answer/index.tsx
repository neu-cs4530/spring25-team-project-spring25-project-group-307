import React, { useEffect, useState } from 'react';
import { ObjectId } from 'mongodb';
import { Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { handleHyperlink } from '../../../../tool';
import AnswerVoteComponent from '../../voteAnswerComponent';
import CommentSection from '../../commentSection';
import './index.css';
import { PopulatedDatabaseAnswer, Comment, DatabaseComment } from '../../../../types/types';

/**
 * Interface representing the props for the AnswerView component.
 *
 * - text The content of the answer.
 * - ansBy The username of the user who wrote the answer.
 * - meta Additional metadata related to the answer.
 * - comments An array of comments associated with the answer.
 * - handleAddComment Callback function to handle adding a new comment.
 */
interface AnswerProps {
  text: string;
  ansBy: string;
  meta: string;
  comments: DatabaseComment[];
  handleAddComment: (comment: Comment) => void;
  handleDeleteComment: (commentId: ObjectId) => void;
  handleDeleteAnswer: () => void;
  currentRole: string;
  answer: PopulatedDatabaseAnswer;
}

/**
 * AnswerView component that displays the content of an answer with the author's name and metadata.
 * The answer text is processed to handle hyperlinks, and a comment section is included.
 *
 * @param text The content of the answer.
 * @param ansBy The username of the answer's author.
 * @param meta Additional metadata related to the answer.
 * @param comments An array of comments associated with the answer.
 * @param handleAddComment Function to handle adding a new comment.
 */
const AnswerView = ({
  text,
  ansBy,
  meta,
  comments,
  handleAddComment,
  handleDeleteComment,
  handleDeleteAnswer,
  currentRole,
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
      // eslint-disable-next-line no-console
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className='answer'>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <AnswerVoteComponent answer={answer} />

        <Box>
          <div className='answerText'>{handleHyperlink(text)}</div>

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
        </Box>
      </Box>

      <CommentSection
        comments={commentList}
        handleAddComment={handleAddComment}
        handleDeleteComment={onDeleteComment}
        currentRole={currentRole}
      />
    </div>
  );
};

export default AnswerView;
