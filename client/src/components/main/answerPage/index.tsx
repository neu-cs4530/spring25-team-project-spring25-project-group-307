import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { ObjectId } from 'mongodb';
import { useLocation, useNavigate } from 'react-router-dom';
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
import useUserContext from '../../../hooks/useUserContext';

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

  const { user } = useUserContext();
  const [moderate, setModerate] = useState<boolean>(false);

  const location = useLocation();
  const navigate = useNavigate();

  const fromFeed = location.state?.fromFeed || false;
  const scrollPosition = location.state?.scrollPosition || 0;
  const numFeedQuestionsBeforeNav = location.state?.numFeedQuestionsBeforeNav || 0;

  const handleClickModerate = () => {
    setModerate(!moderate);
  };

  if (!question) {
    return null;
  }

  const handleReturnToFeed = () => {
    navigate('/feed', {
      state: { fromFeed, scrollPosition, numFeedQuestionsBeforeNav },
    });
  };

  return (
    <Box sx={{ maxWidth: '1000px', mx: 'auto', mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mx: 2 }}>
        {community && (
          <Button
            variant='outlined'
            startIcon={<ArrowBackIosIcon />}
            sx={{
              my: 2,
              borderRadius: '8px',
            }}
            onClick={fromFeed ? handleReturnToFeed : handleReturnToCommunity}>
            {fromFeed ? 'Back to Feed' : 'Go to Community'}
          </Button>
        )}
        {community && (currentRole === 'MODERATOR' || currentRole === 'ADMIN') && (
          <Button
            variant={moderate ? 'contained' : 'outlined'}
            size='small'
            color='error'
            sx={{ my: 2, borderRadius: '8px' }}
            onClick={handleClickModerate}>
            {moderate ? 'Stop Moderating' : 'Moderate'}
          </Button>
        )}
      </Box>
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
        {community && (currentRole === 'ADMIN' || currentRole === 'MODERATOR') && moderate && (
          <DeleteQuestionComponent
            deleteQuestionFromCommunity={handleDeleteQuestionFromCommunity}
            deleteQuestionGlobal={handleDeleteQuestionGlobal}
          />
        )}
      </Box>
      <AnswerHeader
        ansCount={question.answers.length}
        title={question.title}
        question={question}
        user={user}
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
        moderate={moderate}
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
          moderate={moderate}
          answer={a}
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
