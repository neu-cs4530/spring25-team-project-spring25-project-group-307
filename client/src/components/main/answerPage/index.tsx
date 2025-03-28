import React from 'react';
import { Box, Button } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { ObjectId } from 'mongodb';
import { getMetaData } from '../../../tool';
import AnswerView from './answer';
import AnswerHeader from './header';
import { Comment } from '../../../types/types';
import './index.css';
import QuestionBody from './questionBody';
import VoteComponent from '../voteComponent';
import CommentSection from '../commentSection';
import useAnswerPage from '../../../hooks/useAnswerPage';
import DeleteQuestionComponent from '../deleteQuestionComponent';

/**
 * AnswerPage component that displays the full content of a question along with its answers.
 * It also includes the functionality to vote, ask a new question, and post a new answer.
 */
const AnswerPage = () => {
  const {
    questionID,
    question,
    handleNewComment,
    handleDeleteComment,
    handleNewAnswer,
    handleDeleteAnswer,
    community,
    handleReturnToCommunity,
    handleDeleteQuestionFromCommunity,
    handleDeleteQuestionGlobal,
    currentRole,
  } = useAnswerPage();

  if (!question) {
    return null;
  }

  return (
    <Box sx={{ maxWidth: '1000px', mx: 'auto', mt: 2 }}>
      {community && (
        <Button
          variant='outlined'
          startIcon={<ArrowBackIosIcon />}
          sx={{
            my: 2,
            ml: 2,
            borderRadius: '8px',
          }}
          onClick={handleReturnToCommunity}>
          Go to Community
        </Button>
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          ml: 2,
        }}>
        <VoteComponent question={question} />
        {/* Conditional Delete Button */}
        {community && (currentRole === 'ADMIN' || currentRole === 'MODERATOR') && (
          <DeleteQuestionComponent
            deleteQuestionFromCommunity={handleDeleteQuestionFromCommunity}
            deleteQuestionGlobal={handleDeleteQuestionGlobal}
          />
        )}
      </Box>
      <AnswerHeader
        ansCount={question.answers.length}
        title={question.title}
        community={community}
      />
      <QuestionBody
        views={question.views.length}
        text={question.text}
        askby={question.askedBy}
        meta={getMetaData(new Date(question.askDateTime))}
      />
      <CommentSection
        comments={question.comments}
        handleAddComment={(comment: Comment) => handleNewComment(comment, 'question', questionID)}
        handleDeleteComment={(commentId: ObjectId) => handleDeleteComment(commentId)}
        currentRole={currentRole}
      />
      {question.answers.map(a => (
        <AnswerView
          key={String(a._id)}
          text={a.text}
          ansBy={a.ansBy}
          meta={getMetaData(new Date(a.ansDateTime))}
          comments={a.comments}
          handleAddComment={(comment: Comment) =>
            handleNewComment(comment, 'answer', String(a._id))
          }
          handleDeleteComment={(commentId: ObjectId) => handleDeleteComment(commentId)}
          handleDeleteAnswer={() => handleDeleteAnswer(a._id)}
          currentRole={currentRole}
        />
      ))}
      <Button
        variant='contained'
        color='primary'
        sx={{ my: 2, borderRadius: '8px' }}
        onClick={() => {
          handleNewAnswer();
        }}>
        Answer Question
      </Button>
    </Box>
  );
};

export default AnswerPage;
