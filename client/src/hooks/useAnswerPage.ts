import { ObjectId } from 'mongodb';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Comment,
  VoteUpdatePayload,
  PopulatedDatabaseQuestion,
  PopulatedDatabaseAnswer,
  DatabaseCommunity,
  PopulatedDatabaseComment,
} from '../types/types';
import useUserContext from './useUserContext';
import { addComment, deleteComment } from '../services/commentService';
import { getQuestionById, getCommunityQuestion, deleteQuestion } from '../services/questionService';
import { deleteQuestionFromCommunity } from '../services/communityService';
import { deleteAnswer } from '../services/answerService';

/**
 * Custom hook for managing the answer page's state, navigation, and real-time updates.
 *
 * @returns questionID - The current question ID retrieved from the URL parameters.
 * @returns question - The current question object with its answers, comments, and votes.
 * @returns handleNewComment - Function to handle the submission of a new comment to a question or answer.
 * @returns handleNewAnswer - Function to navigate to the "New Answer" page
 */
const useAnswerPage = () => {
  const { qid } = useParams();
  const navigate = useNavigate();

  const { user, socket } = useUserContext();
  const [questionID, setQuestionID] = useState<string>(qid || '');
  const [question, setQuestion] = useState<PopulatedDatabaseQuestion | null>(null);
  const [community, setCommunity] = useState<DatabaseCommunity | null>(null);
  const [currentRole, setCurrentRole] = useState<string>('None');

  /**
   * Function to handle navigation to the "New Answer" page.
   */
  const handleNewAnswer = () => {
    navigate(`/new/answer/${questionID}`);
  };

  useEffect(() => {
    if (!qid) {
      navigate('/home');
      return;
    }

    setQuestionID(qid);
  }, [qid, navigate]);

  /**
   * Function to handle the submission of a new comment to a question or answer.
   *
   * @param comment - The comment object to be added.
   * @param targetType - The type of target being commented on, either 'question' or 'answer'.
   * @param targetId - The ID of the target being commented on.
   */
  const handleNewComment = async (
    comment: Comment,
    targetType: 'question' | 'answer',
    targetId: string | undefined,
  ) => {
    try {
      if (targetId === undefined) {
        throw new Error('No target ID provided.');
      }

      await addComment(targetId, targetType, comment);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error adding comment:', error);
    }
  };

  /**
   * Function to handle deleting a comment from a question or answer.
   */
  const handleDeleteComment = async (commentID: ObjectId) => {
    if (question) {
      const res = await deleteComment(commentID);
      if (res) {
        const updatedComments = question.comments.filter(comment => comment._id !== commentID);
        setQuestion({ ...question, comments: updatedComments });
      }
    }
  };

  /**
   * Function to handle navigating to the community the question is from.
   */
  const handleReturnToCommunity = () => {
    if (community) {
      navigate(`/community/${community._id}`);
    }
  };

  /**
   * Function to delete a question from a community.
   */
  const handleDeleteQuestionFromCommunity = async () => {
    if (community && question) {
      const res = await deleteQuestionFromCommunity(community._id, question._id);
      if (res) {
        navigate(`/community/${community._id}`);
      }
    }
  };

  /**
   * Function to delete a question globally.
   */
  const handleDeleteQuestionGlobal = async () => {
    if (question) {
      const res = await deleteQuestion(question._id);
      if (res) {
        navigate('/home');
      }
    }
  };

  /**
   * Function to delete an answer from a question.
   */
  const handleDeleteAnswer = async (answerID: ObjectId) => {
    if (question) {
      const res = await deleteAnswer(answerID);
      if (res) {
        const updatedAnswers = question.answers.filter(answer => answer._id !== answerID);
        setQuestion({ ...question, answers: updatedAnswers });
      }
    }
  };

  useEffect(() => {
    /**
     * Function to fetch the question data based on the question ID.
     */
    const fetchData = async () => {
      try {
        const res = await getQuestionById(questionID, user.username);
        setQuestion(res || null);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching question:', error);
      }
    };

    // eslint-disable-next-line no-console
    fetchData().catch(e => console.log(e));
  }, [questionID, user.username]);

  useEffect(() => {
    const setCurrentUserRole = () => {
      if (community) {
        if (community.admins.some(admin => admin === user?._id)) {
          setCurrentRole('ADMIN');
        } else if (community.moderators.some(moderator => moderator === user?._id)) {
          setCurrentRole('MODERATOR');
        } else {
          setCurrentRole('MEMBER');
        }
      }
    };

    setCurrentUserRole();
  }, [community, user, currentRole]);

  useEffect(() => {
    /**
     * Function to determine if the question is part of a community.
     */
    const isCommunityQuestion = async (): Promise<void> => {
      try {
        if (!question) {
          return; // Do not fetch community if question does not exist
        }
        const questionCommunity: DatabaseCommunity | null = await getCommunityQuestion(
          question._id,
        );
        setCommunity(questionCommunity || null);
      } catch (error) {
        setCommunity(null);
      }
    };

    // eslint-disable-next-line no-console
    isCommunityQuestion().catch(e => console.log(e));
  }, [question]);

  useEffect(() => {
    /**
     * Function to handle updates to the answers of a question.
     *
     * @param answer - The updated answer object.
     */
    const handleAnswerUpdate = ({
      qid: id,
      answer,
    }: {
      qid: ObjectId;
      answer: PopulatedDatabaseAnswer;
    }) => {
      if (String(id) === questionID) {
        setQuestion(prevQuestion =>
          prevQuestion
            ? // Creates a new Question object with the new answer appended to the end
              { ...prevQuestion, answers: [...prevQuestion.answers, answer] }
            : prevQuestion,
        );
      }
    };

    /**
     * Function to handle updates to the comments of a question or answer.
     *
     * @param result - The updated question or answer object.
     * @param type - The type of the object being updated, either 'question' or 'answer'.
     */
    const handleCommentUpdate = ({
      result,
      type,
    }: {
      result: PopulatedDatabaseQuestion | PopulatedDatabaseAnswer | PopulatedDatabaseComment;
      type: 'question' | 'answer' | 'comment';
    }) => {
      if (type === 'question') {
        const questionResult = result as PopulatedDatabaseQuestion;

        if (String(questionResult._id) === questionID) {
          setQuestion(questionResult);
        }
      } else if (type === 'answer') {
        setQuestion(prevQuestion =>
          prevQuestion
            ? // Updates answers with a matching object ID, and creates a new Question object
              {
                ...prevQuestion,
                answers: prevQuestion.answers.map(a =>
                  a._id === result._id ? (result as PopulatedDatabaseAnswer) : a,
                ),
              }
            : prevQuestion,
        );
      }
    };

    /**
     * Function to handle updates to the views of a question.
     *
     * @param q The updated question object.
     */
    const handleViewsUpdate = (q: PopulatedDatabaseQuestion) => {
      if (String(q._id) === questionID) {
        setQuestion(q);
      }
    };

    /**
     * Function to handle vote updates for a question.
     *
     * @param voteData - The updated vote data for a question
     */
    const handleVoteUpdate = (voteData: VoteUpdatePayload) => {
      if (voteData.qid === questionID) {
        setQuestion(prevQuestion =>
          prevQuestion
            ? {
                ...prevQuestion,
                upVotes: [...voteData.upVotes],
                downVotes: [...voteData.downVotes],
              }
            : prevQuestion,
        );
      }
    };

    socket.on('answerUpdate', handleAnswerUpdate);
    socket.on('viewsUpdate', handleViewsUpdate);
    socket.on('commentUpdate', handleCommentUpdate);
    socket.on('voteUpdate', handleVoteUpdate);

    return () => {
      socket.off('answerUpdate', handleAnswerUpdate);
      socket.off('viewsUpdate', handleViewsUpdate);
      socket.off('commentUpdate', handleCommentUpdate);
      socket.off('voteUpdate', handleVoteUpdate);
    };
  }, [questionID, socket]);

  return {
    questionID,
    question,
    handleNewComment,
    handleDeleteComment,
    handleNewAnswer,
    handleDeleteAnswer,
    community,
    handleReturnToCommunity,
    handleDeleteQuestionFromCommunity,
    handleDeleteQuestionGlobal,
    currentRole,
  };
};

export default useAnswerPage;
