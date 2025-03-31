import React from 'react';
import './index.css';
import { DatabaseCommunity } from '@fake-stack-overflow/shared';
import { Box, Stack, Typography } from '@mui/material';
import AskQuestionButton from '../../askQuestionButton';
import AskCommunityQuestion from '../../askCommunityQuestion';

/**
 * Interface representing the props for the AnswerHeader component.
 *
 * - ansCount - The number of answers to display in the header.
 * - title - The title of the question or discussion thread.
 */
interface AnswerHeaderProps {
  ansCount: number;
  title: string;
  community: DatabaseCommunity | null;
}

/**
 * AnswerHeader component that displays a header section for the answer page.
 * It includes the number of answers, the title of the question, and a button to ask a new question.
 *
 * @param ansCount The number of answers to display.
 * @param title The title of the question or discussion thread.
 */
const AnswerHeader = ({ ansCount, title, community }: AnswerHeaderProps) => (
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

      {/* Ask Question Button */}
      {community ? (
        <AskCommunityQuestion communityID={community._id.toString()} />
      ) : (
        <AskQuestionButton />
      )}
    </Stack>
  </Box>
);

export default AnswerHeader;
