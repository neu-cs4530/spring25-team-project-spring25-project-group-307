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
  const [tagNames, setTagNames] = useState<string>('');
  const [privateCommunity, setPrivateCommunity] = useState<boolean>(false);
  const [titleErr, setTitleErr] = useState<string>('');
  const [descriptionErr, setDescriptionErr] = useState<string>('');
  const [tagErr, setTagErr] = useState<string>('');

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

    const tagnames = tagNames.split(' ').filter(tagName => tagName.trim() !== '');
    if (tagnames.length === 0) {
      setTagErr('Should have at least 1 tag');
      isValid = false;
    } else if (tagnames.length > 5) {
      setTagErr('Cannot have more than 5 tags');
      isValid = false;
    } else {
      setTagErr('');
    }

    for (const tagName of tagnames) {
      if (tagName.length > 20) {
        setTagErr('New tag length cannot be more than 20');
        isValid = false;
        break;
      }
    }

    return isValid;
  };

  const postCommunity = async () => {
    if (!validateForm()) {
      return;
    }
    const tagnames = tagNames.split(' ').filter(tagName => tagName.trim() !== '');
    const tags = tagnames.map(tagName => ({
      name: tagName,
      description: 'user added community tag',
    }));

    const community: Community = {
      title,
      description,
      isPrivate: privateCommunity,
      admins: [user._id],
      moderators: [],
      members: [],
      questions: [],
      pinnedQuestions: [],
      tags,
    };

    const res = await addCommunity(community);

    if (res && res._id) {
      navigate('/communities');
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    tagNames,
    setTagNames,
    setPrivateCommunity,
    titleErr,
    descriptionErr,
    tagErr,
    postCommunity,
  };
};

export default useNewCommunity;
