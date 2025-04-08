import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import { useState } from 'react';
import { getChatsByUser, createChat, sendMessage } from '../services/chatService';
import useUserContext from './useUserContext';

/**
 * Custom hook to handle sharing a question link with another user via chat.
 *
 * @param onClose - callback function to close the share popup
 * @param questionId - ID of the question being shared
 * @returns state and handler functions related to sharing functionality
 */
const useSharePopup = (onClose: () => void, questionId: string) => {
  // Controls visibility of the snackbar notification
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Indicates whether a message is currently being sent
  const [sendLoading, setSendLoading] = useState(false);

  // Get current logged-in user info from context
  const { user } = useUserContext();

  /**
   * Handles the event when a user is selected to share the question with.
   *
   * @param selectedUser - The user receiving the shared question link
   */
  const handleUserSelect = (selectedUser: SafeDatabaseUser) => {
    // Generate the question's URL to send
    const baseUrl = new URL(window.location.origin);
    const questionURL = `${baseUrl}question/${questionId}`;

    // Prepare the message payload
    const message = {
      msg: questionURL,
      msgFrom: user.username,
      msgDateTime: new Date(),
    };

    setSendLoading(true); // Show loading state while sending

    // Check if chat already exists between current user and selected user
    getChatsByUser(user.username)
      .then(chats => {
        const chatWithSelectedUser = chats.find(chat =>
          chat.participants.includes(selectedUser.username),
        );

        if (!chatWithSelectedUser) {
          // No existing chat → create new chat and send message
          createChat([user.username, selectedUser.username]).then(createdChat =>
            sendMessage(message, createdChat._id),
          );
        } else {
          // Existing chat found → directly send message
          sendMessage(message, chatWithSelectedUser._id);
        }
      })
      .finally(() => {
        // Cleanup: Close popup, stop loading, show confirmation snackbar
        setSnackbarOpen(true);
        setSendLoading(false);
        onClose();
      });
  };

  // Expose necessary values and handlers
  return { snackbarOpen, sendLoading, handleUserSelect, setSnackbarOpen };
};

export default useSharePopup;
