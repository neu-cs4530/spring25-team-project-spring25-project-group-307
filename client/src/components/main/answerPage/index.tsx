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
    <>
      {community && (
        <Button
          variant='text'
          startIcon={<ArrowBackIosIcon />}
          sx={{ mx: '12px', mt: '10px' }}
          onClick={handleReturnToCommunity}>
          Go to Community
        </Button>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <VoteComponent question={question} />
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
          answer={a}
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
      <button
        className='bluebtn ansButton'
        onClick={() => {
          handleNewAnswer();
        }}>
        Answer Question
      </button>
    </>
  );
};

export default AnswerPage;
