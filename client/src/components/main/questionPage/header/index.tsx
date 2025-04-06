import React from 'react';
import './index.css';
import { ToggleButtonGroup } from '@mui/material';
import OrderButton from './orderButton';
import { OrderType } from '../../../../types/types';
import { orderTypeDisplayName } from '../../../../types/constants';
import AskQuestionButton from '../../askQuestionButton';

/**
 * Interface representing the props for the QuestionHeader component.
 *
 * titleText - The title text displayed at the top of the header.
 * qcnt - The number of questions to be displayed in the header.
 * setQuestionOrder - A function that sets the order of questions based on the selected message.
 */
interface QuestionHeaderProps {
  questionOrder: OrderType;
  titleText: string;
  qcnt: number;
  setQuestionOrder: (order: OrderType) => void;
}

/**
 * QuestionHeader component displays the header section for a list of questions.
 * It includes the title, a button to ask a new question, the number of the quesions,
 * and buttons to set the order of questions.
 *
 * @param titleText - The title text to display in the header.
 * @param qcnt - The number of questions displayed in the header.
 * @param setQuestionOrder - Function to set the order of questions based on input message.
 */
const QuestionHeader = ({
  questionOrder,
  titleText,
  qcnt,
  setQuestionOrder,
}: QuestionHeaderProps) => (
  <div>
    <div className='space_between right_padding'>
      <div className='bold_title'>{titleText}</div>
      <AskQuestionButton />
    </div>
    <div className='space_between right_padding'>
      <div id='question_count'>{qcnt} questions</div>
      <div>
        <ToggleButtonGroup
          size='small'
          color='primary'
          sx={{
            backgroundColor: '#f0f0f0',
          }}
          value={questionOrder}
          exclusive
          onChange={(event, newOrder) => {
            if (newOrder !== null) {
              setQuestionOrder(newOrder);
            }
          }}
          aria-label='text alignment'>
          {Object.keys(orderTypeDisplayName).map(order => (
            <OrderButton key={order} orderType={order as OrderType} />
          ))}
        </ToggleButtonGroup>
      </div>
    </div>
  </div>
);

export default QuestionHeader;
