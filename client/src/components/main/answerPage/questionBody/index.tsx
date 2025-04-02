import React, { useEffect, useState } from 'react';
import './index.css';
import { PopulatedDatabaseQuestion, SafeDatabaseUser } from '@fake-stack-overflow/shared';
import { handleHyperlink } from '../../../../tool';
import {
  addSavedQuestion,
  getUserByUsername,
  removeSavedQuestion,
} from '../../../../services/userService';
import { addReportToQuestion } from '../../../../services/questionService';

/**
 * Interface representing the props for the QuestionBody component.
 *
 * - views - The number of views the question has received.
 * - text - The content of the question, which may contain hyperlinks.
 * - askby - The username of the user who asked the question.
 * - meta - Additional metadata related to the question, such as the date and time it was asked.
 */
interface QuestionBodyProps {
  views: number;
  text: string;
  askby: string;
  meta: string;
  question: PopulatedDatabaseQuestion;
  user: SafeDatabaseUser;
}

type BookmarkIconProps = {
  filled: boolean;
};

const BookmarkIcon: React.FC<BookmarkIconProps> = ({ filled }) => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 24 24'
    fill={filled ? 'black' : 'none'}
    stroke='black'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'>
    <path d='M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z' />
  </svg>
);

const ReportIcon = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 24 24'
    fill='none'
    stroke='black'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'>
    <path d='M4 21V4h16l-4 5 4 5H4' />
  </svg>
);

/**
 * QuestionBody component that displays the body of a question.
 * It includes the number of views, the question content (with hyperlink handling),
 * the username of the author, and additional metadata.
 *
 * @param views The number of views the question has received.
 * @param text The content of the question.
 * @param askby The username of the question's author.
 * @param meta Additional metadata related to the question.
 */
const QuestionBody = ({ views, text, askby, meta, question, user }: QuestionBodyProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserByUsername(user.username);
        setIsSaved(
          data.savedQuestions.some(
            savedQuestionId => savedQuestionId.toString() === question._id.toString(),
          ),
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching saved questions:', error);
      }
    };

    fetchUserData();
  }, [question._id, user.username]);

  useEffect(() => {
    if (question.reportedBy.includes(user._id)) {
      setHasReported(true);
    }
  }, [question.reportedBy, user._id]);

  const handleSave = async () => {
    await addSavedQuestion(user.username, question._id);
    setIsSaved(true);
  };

  const handleUnsave = async () => {
    await removeSavedQuestion(user.username, question._id);
    setIsSaved(false);
  };

  const handleReport = async () => {
    await addReportToQuestion(question._id.toString(), user.username);
  };

  return (
    <div id='questionBody' className='questionBody right_padding'>
      <div className='bold_title answer_question_view'>{views} views</div>
      <div className='answer_question_text'>{handleHyperlink(text)}</div>
      <div className='answer_question_right'>
        <div className='question_icons' style={{ display: 'flex', gap: '10px' }}>
          <span
            className='bookmark_icon tooltip-container'
            onClick={isSaved ? handleUnsave : handleSave}>
            <BookmarkIcon filled={isSaved} />
            <span className='tooltip'>{isSaved ? 'Unsave' : 'Save'}</span>
          </span>
          {!hasReported && (
            <span className='report_icon tooltip-container' onClick={handleReport}>
              <ReportIcon />
              <span className='tooltip'>Report</span>
            </span>
          )}
        </div>
        <div className='question_author'>{askby}</div>
        <div className='answer_question_meta'>asked {meta}</div>
      </div>
    </div>
  );
};

export default QuestionBody;
