import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import { useState } from 'react';
import { getChatsByUser, createChat, sendMessage } from '../services/chatService';
import useUserContext from './useUserContext';

const useSharePopup = (onClose: () => void, questionId: string) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const { user } = useUserContext();

  const handleUserSelect = (selectedUser: SafeDatabaseUser) => {
    const baseUrl = new URL(window.location.origin);

    const questionURL = `${baseUrl}question/${questionId}`;

    const message = { msg: questionURL, msgFrom: user.username, msgDateTime: new Date() };
    setSendLoading(true);

    getChatsByUser(user.username)
      .then(chats => {
        const chatWithSelectedUser = chats.find(chat =>
          chat.participants.includes(selectedUser.username),
        );

        if (!chatWithSelectedUser) {
          createChat([user.username, selectedUser.username]).then(createdChat =>
            sendMessage(message, createdChat._id),
          );
        } else {
          sendMessage(message, chatWithSelectedUser._id);
        }
      })
      .finally(() => {
        setSnackbarOpen(true);
        setSendLoading(false);
        onClose();
      });
  };
  return { snackbarOpen, sendLoading, handleUserSelect, setSnackbarOpen };
};
export default useSharePopup;
