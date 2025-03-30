import { useEffect, useState } from 'react';
import useUserContext from './useUserContext';
import { PopulatedDatabaseAnswer } from '../types/types';

/**
 * Custom hook to manage vote status for an answer.
 */
const useAnswerVoteStatus = ({ answer }: { answer: PopulatedDatabaseAnswer }) => {
  const { user, socket } = useUserContext();
  const [count, setCount] = useState<number>(0);
  const [voted, setVoted] = useState<number>(0);

  // Local vote tracking logic
  useEffect(() => {
    const getVoteValue = () => {
      if (user.username && answer?.upVotes?.includes(user.username)) return 1;
      if (user.username && answer?.downVotes?.includes(user.username)) return -1;
      return 0;
    };

    setCount((answer.upVotes || []).length - (answer.downVotes || []).length);
    setVoted(getVoteValue());
  }, [answer, user.username]);

  // Socket listener for real-time updates
  useEffect(() => {
    const handleVoteUpdate = (payload: { aid: string; upVotes: string[]; downVotes: string[] }) => {
      if (payload.aid !== String(answer._id)) return;

      setCount(payload.upVotes.length - payload.downVotes.length);
      if (payload.upVotes.includes(user.username)) {
        setVoted(1);
      } else if (payload.downVotes.includes(user.username)) {
        setVoted(-1);
      } else {
        setVoted(0);
      }
    };

    socket?.on('answerVoteUpdate', handleVoteUpdate);

    return () => {
      socket?.off('answerVoteUpdate', handleVoteUpdate);
    };
  }, [answer._id, user.username, socket]);

  return { count, setCount, voted, setVoted };
};

export default useAnswerVoteStatus;
