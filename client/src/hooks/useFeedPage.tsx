import { useState, useEffect, useRef } from 'react';
import { PopulatedDatabaseQuestion } from '@fake-stack-overflow/shared';

const useFeedPage = () => {
  const [questions, setQuestions] = useState<Omit<PopulatedDatabaseQuestion, '_id'>[]>([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
  const [noMoreContent, setNoMoreContent] = useState(true);

  const pageEndElement = useRef(null);
  const getMoreQuestions = async (limit: number) => {
    setIsQuestionsLoading(true);

    await new Promise(resolve => {
      setTimeout(resolve, 1000);
    });
    setQuestions(prev => [
      ...prev,
      {
        title: 'Title1',
        text: 'Text1',
        tags: [],
        answers: [],
        comments: [],
        askedBy: '',
        askDateTime: new Date(),
        views: [],
        upVotes: [],
        downVotes: [],
      },
      {
        title: 'Title2',
        text: 'Text2',
        tags: [],
        answers: [],
        comments: [],
        askedBy: '',
        askDateTime: new Date(),
        views: [],
        upVotes: [],
        downVotes: [],
      },
      {
        title: 'Title3',
        text: 'Text3',
        tags: [],
        answers: [],
        comments: [],
        askedBy: '',
        askDateTime: new Date(),
        views: [],
        upVotes: [],
        downVotes: [],
      },
    ]);
    setIsQuestionsLoading(false);
    // Todo: make sure we only set this if we know from the api that more content is available
    setNoMoreContent(false);
  };

  const resetFeed = () => {
    setQuestions([]);
    getMoreQuestions(3);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !noMoreContent) {
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
  }, [noMoreContent]);

  return { questions, isQuestionsLoading, pageEndElement, noMoreContent, resetFeed };
};

export default useFeedPage;
