import { useState, useEffect, useRef, useCallback } from 'react';
import { FeedItem } from '@fake-stack-overflow/shared';
import { getNext, refresh } from '../services/feedService';
import useUserContext from './useUserContext';

const useFeedPage = () => {
  const [feedItems, setFeedItems] = useState<Omit<FeedItem, '_id'>[]>([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(true);
  const [noMoreContent, setNoMoreContent] = useState(false);
  const { user: currentUser } = useUserContext();
  const [isFetching, setIsFetching] = useState(false);

  const isFetchingRef = useRef(isFetching);
  const noMoreContentRef = useRef(noMoreContent);

  const pageEndElement = useRef(null);
  const getMoreQuestions = useCallback(
    async (limit: number) => {
      if (isFetching) return;
      setIsFetching(true);
      setIsQuestionsLoading(true);

      await new Promise(resolve => {
        setTimeout(resolve, 1000);
      });

      const newQuestions = await getNext(currentUser._id, limit);

      setFeedItems(prev => [...prev, ...newQuestions]);
      setIsFetching(false);
      setIsQuestionsLoading(false);
      if (newQuestions.length === 0) {
        setNoMoreContent(true);
      } else {
        setNoMoreContent(false);
      }
    },
    [currentUser._id, isFetching],
  );

  const resetFeed = async () => {
    await refresh(currentUser._id);
    setFeedItems([]);
    getMoreQuestions(3);
  };

  const setupFeed = async () => {
    await refresh(currentUser._id);
  };

  useEffect(() => {
    isFetchingRef.current = isFetching;
  }, [isFetching]);

  useEffect(() => {
    noMoreContentRef.current = noMoreContent;
  }, [noMoreContent]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !noMoreContentRef.current && !isFetchingRef.current) {
          getMoreQuestions(3);
        }
      },
      {
        root: null, // Defaults to viewport
        rootMargin: '0px',
        threshold: 0.5, // Trigger when 50% of the element is visible
      },
    );
    const targetElement = pageEndElement.current;

    if (targetElement) {
      observer.observe(targetElement);
    }

    return () => {
      if (targetElement) {
        observer.unobserve(targetElement);
      }
    };
  }, [getMoreQuestions]);

  return { feedItems, isQuestionsLoading, pageEndElement, noMoreContent, resetFeed, setupFeed };
};

export default useFeedPage;
