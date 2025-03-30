import React from 'react';
import { handleHyperlink, getMetaData } from '../../../tool';
import CommentSection from '../commentSection';
import AnswerVoteComponent from '../answerVoteComponent';
import { Comment, PopulatedDatabaseAnswer } from '../../../types/types';
import './index.css';

interface AnswerProps {
  answer: PopulatedDatabaseAnswer;
  handleAddComment: (comment: Comment) => void;
}

const AnswerView = ({ answer, handleAddComment }: AnswerProps) => (
  <div className='answer right_padding'>
    {/* Voting */}
    <AnswerVoteComponent answer={answer} />

    {/* Answer text */}
    <div id='answerText' className='answerText'>
      {handleHyperlink(answer.text)}
    </div>

    {/* Author & meta info */}
    <div className='answerAuthor'>
      <div className='answer_author'>{answer.ansBy}</div>
      <div className='answer_question_meta'>
        answered {getMetaData(new Date(answer.ansDateTime))}
      </div>
    </div>

    {/* Comments */}
    <CommentSection comments={answer.comments} handleAddComment={handleAddComment} />
  </div>
);

export default AnswerView;
