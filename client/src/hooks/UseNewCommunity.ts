import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Community } from '@fake-stack-overflow/shared/types/community';
import { addCommunity } from '../services/communityService';
import useUserContext from './useUserContext';

/**
 * Custom hook to handle adding communities and form validation.
 *
 * @returns title - The current value of the title input.
 * @returns setTitle - Function to set the title input value.
 * @returns description - The current value of the description input.
 * @returns setDescription - Function to set the description input value.
 * @returns titleErr - Error message for the title field, if any.
 * @returns descriptionErr - Error message for the description field, if any.
 * @returns postCommunity - Function to validate the form and submit a new community.
 */
const useNewCommunity = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [privateCommunity, setPrivateCommunity] = useState<boolean>(false);
  const [titleErr, setTitleErr] = useState<string>('');
  const [descriptionErr, setDescriptionErr] = useState<string>('');

  const validateForm = (): boolean => {
    let isValid = true;

    if (!title) {
      setTitleErr('Title cannot be empty');
      isValid = false;
    } else if (title.length > 100) {
      setTitleErr('Title cannot be more than 100 characters');
      isValid = false;
    } else {
      setTitleErr('');
    }

    if (!description) {
      setDescriptionErr('Description cannot be empty');
      isValid = false;
    } else {
      setDescriptionErr('');
    }

    return isValid;
  };

  const postCommunity = async () => {
    if (validateForm()) {
      try {
        if (!validateForm()) {
          return;
        }
        const community: Community = {
          title,
          description,
          isPrivate: privateCommunity,
          admins: [user._id],
          moderators: [],
          members: [],
          questions: [],
        };

        const res = await addCommunity(community);

        if (res && res._id) {
          navigate('/communities');
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    setPrivateCommunity,
    titleErr,
    descriptionErr,
    postCommunity,
  };
};

export default useNewCommunity;
