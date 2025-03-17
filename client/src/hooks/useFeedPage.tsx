import { useState, useEffect } from 'react';
import {
  DatabaseQuestion,
  PopulatedDatabaseQuestion,
  SafeDatabaseUser,
} from '@fake-stack-overflow/shared';
import { Community } from '../types/community';

const useFeedPage = () => {
  const [questions, setQuestions] = useState<Omit<PopulatedDatabaseQuestion, '_id'>[]>([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(true);

  useEffect(() => {
    // api call goes here
    setIsQuestionsLoading(true);
    new Promise(resolve => {
      setTimeout(resolve, 1000);
    }).then(() => {
      setQuestions([
        {
          title: '',
          text: '',
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
          title: '',
          text: '',
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
          title: '',
          text: '',
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
    });
  }, []);

  const getMoreQuestions = (limit: number) => {
    setIsQuestionsLoading(true);

    new Promise(resolve => {
      setTimeout(resolve, 1000);
    }).then(() => {
      setQuestions(prev => [
        ...prev,
        {
          title: '',
          text: '',
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
    });
  };

  return { questions, isQuestionsLoading, getMoreQuestions };
};

export default useFeedPage;
