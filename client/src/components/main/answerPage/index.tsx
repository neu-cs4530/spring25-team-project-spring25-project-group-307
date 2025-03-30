import React from 'react';
import { Button } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { getMetaData } from '../../../tool';

import AnswerHeader from './header';
import { Comment } from '../../../types/types';
import './index.css';
import QuestionBody from './questionBody';
import VoteComponent from '../voteComponent';
import CommentSection from '../commentSection';
import useAnswerPage from '../../../hooks/useAnswerPage';
import AnswerView from './answerView';

/**
 * AnswerPage component that displays the full content of a question along with its answers.
 * It also includes the functionality to vote, ask a new question, and post a new answer.
 */
const AnswerPage = () => {
  const {
    questionID,
    question,
    handleNewComment,
    handleNewAnswer,
    community,
    handleReturnToCommunity,
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
      <VoteComponent question={question} />
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
      />
      {question.answers.map(answer => (
        <AnswerView
          key={String(answer._id)}
          answer={answer}
          handleAddComment={(comment: Comment) =>
            handleNewComment(comment, 'answer', String(answer._id))
          }
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
