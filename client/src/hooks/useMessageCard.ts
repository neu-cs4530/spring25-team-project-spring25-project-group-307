import { DatabaseMessage, PopulatedDatabaseQuestion } from '@fake-stack-overflow/shared';
import { useState, useEffect } from 'react';
import { getQuestionById } from '../services/questionService';
import useUserContext from './useUserContext';

// Custom hook to fetch and return a question if the message contains a valid question URL
const useMessageCard = (message: DatabaseMessage) => {
  // State to store the fetched question (if found)
  const [question, setQuestion] = useState<PopulatedDatabaseQuestion | null>(null);

  // Get the currently logged-in user from context
  const { user } = useUserContext();

  useEffect(() => {
    // Utility function to check if a string is a valid URL
    const isValidUrl = (input: string) => {
      try {
        const url = new URL(input);
        return url;
      } catch {
        return undefined;
      }
    };

    const baseUrl = new URL(window.location.origin); // The base URL of the current site
    const maybeUrl = isValidUrl(message.msg); // Check if the message content is a valid URL

    if (maybeUrl) {
      // Check if URL belongs to the same site and is pointing to a question route
      if (
        maybeUrl &&
        baseUrl.hostname === maybeUrl.hostname &&
        maybeUrl.pathname.startsWith('/question')
      ) {
        // Extract parts of the URL path (e.g., /question/:questionId)
        const parts = maybeUrl.pathname.replace(/\/$/, '').split('/');
        parts.shift(); // Remove empty first element due to leading slash

        // Validate URL structure: it should look like /question/:questionId
        if (parts.length === 2 && parts[0] === 'question') {
          // Fetch the question data by ID and update state
          getQuestionById(parts[1], user.username)
            .then(res => setQuestion(res || null))
            .catch(() => setQuestion(null)); // Handle fetch error by setting question to null
        }
      }
    }
  }, [message.msg, user.username]); // Run effect when message content or username changes

  // Return the fetched question (if any)
  return {
    question,
  };
};

export default useMessageCard;
