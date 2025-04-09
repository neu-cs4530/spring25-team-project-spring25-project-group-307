import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { validateHyperlink } from '../tool';
import { addAnswer } from '../services/answerService';
import { useAchievement } from '../contexts/AchievementContext';
import useUserContext from './useUserContext';
import { Answer } from '../types/types';

/**
 * Custom hook for managing the state and logic of an answer submission form.
 *
 * @returns text - the current text input for the answer.
 * @returns textErr - the error message related to the text input.
 * @returns setText - the function to update the answer text input.
 * @returns postAnswer - the function to submit the answer after validation.
 */
const useAnswerForm = () => {
  const { qid } = useParams();
  const navigate = useNavigate();
  const { triggerAchievement } = useAchievement();
  const { user } = useUserContext();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [questionID, setQuestionID] = useState<string>('');

  useEffect(() => {
    if (!qid) {
      setTextErr('Question ID is missing.');
      navigate('/home');
      return;
    }

    setQuestionID(qid);
  }, [qid, navigate]);

  /**
   * Function to post an answer to a question.
   * It validates the answer text and posts the answer if it is valid.
   */
  const postAnswer = async () => {
    let isValid = true;

    if (!text) {
      setTextErr('Answer text cannot be empty');
      isValid = false;
    }

    // Hyperlink validation
    if (!validateHyperlink(text)) {
      setTextErr('Invalid hyperlink format.');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    const answer: Answer = {
      text,
      ansBy: user.username,
      ansDateTime: new Date(),
      comments: [],
      upVotes: [],
      downVotes: [],
    };

    try {
      const res = await addAnswer(questionID, answer);

      if (res.unlockedAchievements?.length > 0) {
        res.unlockedAchievements.forEach(triggerAchievement);
      }

      if (res) {
        navigate(`/question/${questionID}`);
      }
    } catch (err) {
      // catch error
      setTextErr('Something went wrong while submitting your answer.');
    }
  };

  return {
    text,
    textErr,
    setText,
    postAnswer,
  };
};

export default useAnswerForm;
