import React, { useEffect, useMemo, useState } from 'react';
import './index.css';
import { DatabaseMessage, PopulatedDatabaseQuestion } from '../../../types/types';
import { getMetaData } from '../../../tool';
import { getQuestionById } from '../../../services/questionService';
import useUserContext from '../../../hooks/useUserContext';
import EmbededQuestionView from './embededQuestionView';

/**
 * MessageCard component displays a single message with its sender and timestamp.
 *
 * @param message: The message object to display.
 */

const MessageCard = ({ message }: { message: DatabaseMessage }) => {
  const [question, setQuestion] = useState<PopulatedDatabaseQuestion | null>(null);
  const { user } = useUserContext();

  useEffect(() => {
    const isValidUrl = (input: string) => {
      try {
        const url = new URL(input);
        return url;
      } catch {
        return undefined;
      }
    };

    const baseUrl = new URL(window.location.origin);
    const maybeUrl = isValidUrl(message.msg);

    if (maybeUrl) {
      if (
        maybeUrl &&
        baseUrl.hostname === maybeUrl.hostname &&
        maybeUrl.pathname.startsWith('/question')
      ) {
        // remove leading and trailing slash and put the url parts in an array
        const parts = maybeUrl.pathname.replace(/\/$/, '').split('/');
        parts.shift();
        if (parts.length === 2 && parts[0] === 'question') {
          getQuestionById(parts[1], user.username)
            .then(res => setQuestion(res || null))
            .catch(() => setQuestion(null));
        }
      }
    }
  }, []);

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
