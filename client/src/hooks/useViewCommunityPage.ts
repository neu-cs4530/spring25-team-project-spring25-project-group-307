import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ObjectId } from 'mongodb';
import { PopulatedDatabaseCommunity, PopulatedDatabaseQuestion } from '@fake-stack-overflow/shared';
import {
  addUserToCommunity,
  getCommunityById,
  pinQuestion,
  unpinQuestion,
  updateUserRole,
} from '../services/communityService';
import { getUserByUsername } from '../services/userService';
import useUserContext from './useUserContext';

/**
 * Custom hook for managing the answer page's state, navigation, and real-time updates.
 *
 * @returns questionID - The current question ID retrieved from the URL parameters.
 * @returns question - The current question object with its answers, comments, and votes.
 * @returns handleNewComment - Function to handle the submission of a new comment to a question or answer.
 * @returns handleNewAnswer - Function to navigate to the "New Answer" page
 */
const useViewCommunityPage = () => {
  const { cid } = useParams();
  const { user } = useUserContext();
  const navigate = useNavigate();

  const [pinnedStates, setPinnedStates] = useState<Record<string, boolean>>({});
  const [pinToggled, setPinToggled] = useState<boolean>(false);
  const [community, setCommunity] = useState<PopulatedDatabaseCommunity | null>(null);
  const [currentRole, setCurrentRole] = useState<string>('None');
  const [users, setUsers] = useState<ObjectId[]>([]);
  const [open, setOpen] = useState(false);
  const [userToAdd, setUserToAdd] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSetUsername = (newUsername: string) => setUserToAdd(newUsername);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const enrichQuestionsWithRanks = async (questions: PopulatedDatabaseQuestion[]) =>
    Promise.all(
      questions.map(async question =>
        getUserByUsername(question.askedBy).then(fetchedUser => ({
          ...question,
          askedByRank: fetchedUser?.ranking ?? null,
        })),
      ),
    );

  const handleRoleChange = async (username: string, newRole: string) => {
    setError(null);

    try {
      // Call the server to update the user's role
      if (!community) {
        throw new Error('Community ID not provided');
      }

      const res = await updateUserRole(community._id, username, newRole);

      if (!res) {
        throw new Error('Failed to update user role');
      }
    } catch (e) {
      setError('Failed to update role');
    }
  };

  /**
   * Function to pin the question to the community.
   */
  const handleTogglePinQuestion = async (question: PopulatedDatabaseQuestion) => {
    if (community) {
      const isPinned = pinnedStates[question._id.toString()] || false;

      if (!isPinned) {
        // Pin the question
        const res = await pinQuestion(community._id, question._id);
        if (res) {
          setPinnedStates(prev => ({
            ...prev,
            [question._id.toString()]: true,
          }));
          setPinToggled(!pinToggled);
        }
      } else {
        // Unpin the question
        const res = await unpinQuestion(community._id, question._id);
        if (res) {
          setPinnedStates(prev => ({
            ...prev,
            [question._id.toString()]: false,
          }));
          setPinToggled(!pinToggled);
        }
      }
    }
  };

  const handleAddUser = async () => {
    try {
      if (!community) {
        throw new Error('Community not found');
      }
      // Add the user to the community
      const res = await addUserToCommunity(community?._id, userToAdd);

      if (!res) {
        throw new Error('Failed to add user to community');
      }

      // Update the users list
      setUsers(res.members.map((u: ObjectId) => u));
      setUserToAdd('');
      handleClose();
    } catch (e) {
      setError('Failed to add user to community');
    }
  };

  useEffect(() => {
    if (!cid) {
      navigate('/home');
      return;
    }

    const fetchCommunity = async () => {
      try {
        const res = await getCommunityById(cid);
        const rankedPinnedQuestions = await enrichQuestionsWithRanks(res.pinnedQuestions || []);
        const rankedUnpinnedQuestions = await enrichQuestionsWithRanks(res.questions || []);

        setCommunity({
          ...res,
          pinnedQuestions: rankedPinnedQuestions,
          questions: rankedUnpinnedQuestions,
        });

        // Initialize pinnedStates
        const initialPinnedStates: Record<string, boolean> = {};
        rankedPinnedQuestions.forEach(question => {
          initialPinnedStates[question._id.toString()] = true;
        });

        rankedUnpinnedQuestions.forEach(question => {
          if (!(question._id.toString() in initialPinnedStates)) {
            initialPinnedStates[question._id.toString()] = false;
          }
        });

        setPinnedStates(initialPinnedStates);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    };

    fetchCommunity();
  }, [cid, navigate, pinToggled, users]);

  useEffect(() => {
    const setCurrentUserRole = () => {
      if (community) {
        if (community.admins.some(admin => admin._id === user?._id)) {
          setCurrentRole('ADMIN');
        } else if (community.moderators.some(moderator => moderator._id === user?._id)) {
          setCurrentRole('MODERATOR');
        } else {
          setCurrentRole('MEMBER');
        }
      }
    };

    setCurrentUserRole();
  }, [community, user]);

  return {
    community,
    currentRole,
    handleTogglePinQuestion,
    handleRoleChange,
    handleSetUsername,
    handleOpen,
    handleClose,
    handleAddUser,
    userToAdd,
    error,
    open,
  };
};

export default useViewCommunityPage;
