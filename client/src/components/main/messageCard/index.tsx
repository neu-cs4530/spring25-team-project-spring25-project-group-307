import './index.css';
import { DatabaseMessage } from '../../../types/types';
import { getMetaData } from '../../../tool';

import EmbededQuestionView from './embededQuestionView';
import useMessageCard from '../../../hooks/useMessageCard';

/**
 * MessageCard component displays a single message with its sender and timestamp.
 *
 * @param message: The message object to display.
 */

const MessageCard = ({ message }: { message: DatabaseMessage }) => {
  // question might be null if the message does not contain a valid question URL
  const { question } = useMessageCard(message);
  return (
    <div className='message'>
      <div className='message-header'>
        <div className='message-sender'>{message.msgFrom}</div>
        <div className='message-time'>{getMetaData(new Date(message.msgDateTime))}</div>
      </div>
      {question ? (
        <EmbededQuestionView question={question} />
      ) : (
        <div className='message-body'>{message.msg}</div>
      )}
    </div>
  );
};

export default MessageCard;
