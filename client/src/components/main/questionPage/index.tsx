import React from 'react';
import './index.css';
import { Box } from '@mui/material';
import QuestionHeader from './header';
import QuestionView from './question';
import useQuestionPage from '../../../hooks/useQuestionPage';

/**
 * QuestionPage component renders a page displaying a list of questions
 * based on filters such as order and search terms.
 * It includes a header with order buttons and a button to ask a new question.
 */
const QuestionPage = () => {
  const { questionOrder, titleText, qlist, setQuestionOrder } = useQuestionPage();

  return (
    <>
      <QuestionHeader
        titleText={titleText}
        qcnt={qlist.length}
        questionOrder={questionOrder}
        setQuestionOrder={setQuestionOrder}
      />
      <Box sx={{ padding: '0% 5%' }}>
        {qlist.map(q => (
          <QuestionView question={q} key={String(q._id)} />
        ))}
      </Box>
      {titleText === 'Search Results' && !qlist.length && (
        <div className='bold_title right_padding'>No Questions Found</div>
      )}
    </>
  );
};

export default QuestionPage;
