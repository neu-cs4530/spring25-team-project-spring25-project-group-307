import React, { useEffect, useState } from 'react';
import './index.css';
import { PopulatedDatabaseQuestion, SafeDatabaseUser } from '@fake-stack-overflow/shared';
import { Box, Stack, Typography } from '@mui/material';
import {
  addSavedQuestion,
  getUserByUsername,
  removeSavedQuestion,
} from '../../../../services/userService';
import { addReportToQuestion } from '../../../../services/questionService';

/**
 * Interface representing the props for the AnswerHeader component.
 *
 * - ansCount - The number of answers to display in the header.
 * - title - The title of the question or discussion thread.
 */
interface AnswerHeaderProps {
  ansCount: number;
  title: string;
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
 * AnswerHeader component that displays a header section for the answer page.
 * It includes the number of answers, the title of the question, and a button to ask a new question.
 *
 * @param ansCount The number of answers to display.
 * @param title The title of the question or discussion thread.
 */
const AnswerHeader = ({ ansCount, title, question, user }: AnswerHeaderProps) => {
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
    setHasReported(true);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mx: 2, mt: 2, pb: 2, px: 1 }}>
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        flexWrap='wrap'
        spacing={2}>
        {/* Answer Count */}
        <Typography variant='h6' fontWeight='bold'>
          {ansCount} answers
        </Typography>

        {/* Question Title */}
        <Typography variant='h6' fontWeight='bold' textAlign='center' sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        {/* Bookmark and Report Icons */}
        <Stack className='question_icons' direction='row' spacing={2} alignItems='center'>
          <div
            className='bookmark_icon tooltip-container'
            onClick={isSaved ? handleUnsave : handleSave}>
            <BookmarkIcon filled={isSaved} />
            <span className='tooltip'>{isSaved ? 'Unsave' : 'Save'}</span>
          </div>
          {!hasReported && (
            <div className='report_icon tooltip-container' onClick={handleReport}>
              <ReportIcon />
              <span className='tooltip'>Report</span>
            </div>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default AnswerHeader;
