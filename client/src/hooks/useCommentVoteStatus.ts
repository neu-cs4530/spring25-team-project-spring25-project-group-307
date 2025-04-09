import { useEffect, useState } from 'react';
import useUserContext from './useUserContext';
import { DatabaseComment } from '../types/types';

/**
 * Custom hook to manage vote status for a comment.
 */
const useCommentVoteStatus = ({ comment }: { comment: DatabaseComment }) => {
  const { user, socket } = useUserContext();
  const [count, setCount] = useState<number>(0);
  const [voted, setVoted] = useState<number>(0); // 1 = upvoted, -1 = downvoted, 0 = none

  useEffect(() => {
    const getVoteValue = () => {
      if (user.username && comment?.upVotes?.includes(user.username)) return 1;
      if (user.username && comment?.downVotes?.includes(user.username)) return -1;
      return 0;
    };

    setCount((comment.upVotes || []).length - (comment.downVotes || []).length);
    setVoted(getVoteValue());
  }, [comment, user.username]);

  useEffect(() => {
    const handleVoteUpdate = (payload: { cid: string; upVotes: string[]; downVotes: string[] }) => {
      if (payload.cid !== String(comment._id)) return;

      setCount(payload.upVotes.length - payload.downVotes.length);
      if (payload.upVotes.includes(user.username)) {
        setVoted(1);
      } else if (payload.downVotes.includes(user.username)) {
        setVoted(-1);
      } else {
        setVoted(0);
      }
    };

    socket?.on('commentVoteUpdate', handleVoteUpdate);

    return () => {
      socket?.off('commentVoteUpdate', handleVoteUpdate);
    };
  }, [comment._id, user.username, socket]);

  return { count, setCount, voted, setVoted };
};

export default useCommentVoteStatus;
