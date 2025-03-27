import { useState, useEffect, useRef } from 'react';
import { FeedItem } from '@fake-stack-overflow/shared';
import { getNext, refresh } from '../services/feedService';
import useUserContext from './useUserContext';

const useFeedPage = () => {
  const [feedItems, setFeedItems] = useState<Omit<FeedItem, '_id'>[]>([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(true);
  const [noMoreContent, setNoMoreContent] = useState(false);
  const { user: currentUser } = useUserContext();
  const [isIntersecting, setIsIntersecting] = useState(false);

  const pageEndElement = useRef(null);
  const getMoreQuestions = async (limit: number) => {
    if (isIntersecting) return;
    setIsIntersecting(true);
    setIsQuestionsLoading(true);

    await new Promise(resolve => {
      setTimeout(resolve, 1000);
    });

    const newQuestions = await getNext(currentUser._id, limit);

    setFeedItems(prev => [...prev, ...newQuestions]);
    setIsIntersecting(false);
    setIsQuestionsLoading(false);
    if (newQuestions.length === 0) {
      setNoMoreContent(true);
    } else {
      setNoMoreContent(false);
    }
  };

  const resetFeed = async () => {
    await refresh(currentUser._id);
    setFeedItems([]);
    getMoreQuestions(3);
  };

  const setupFeed = async () => {
    await refresh(currentUser._id);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !noMoreContent && !isIntersecting) {
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
