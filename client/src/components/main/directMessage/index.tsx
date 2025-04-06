import { useState } from 'react';
import './index.css';
import { Autocomplete, Box, Button, Modal, TextField, Typography } from '@mui/material';
import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import useDirectMessage from '../../../hooks/useDirectMessage';
import ChatsListCard from './chatsListCard';
import MessageCard from '../messageCard';
import useUsersListPage from '../../../hooks/useUsersListPage';

/**
 * DirectMessage component renders a page for direct messaging between users.
 * It includes a list of users and a chat window to send and receive messages.
 */
const DirectMessage = () => {
  const [selectedUser, setSelectedUser] = useState<SafeDatabaseUser | null>(null);
  const {
    selectedChat,
    chats,
    newMessage,
    setNewMessage,
    showCreatePanel,
    setShowCreatePanel,
    handleSendMessage,
    handleChatSelect,
    handleUserSelect,
    handleCreateChat,
    error,
  } = useDirectMessage();

  const { userList } = useUsersListPage();

  const handleClostModal = () => {
    setShowCreatePanel(false);
    setSelectedUser(null);
  };

  return (
    <>
      <Box sx={{ mx: 2, mt: 2 }}>
        <Button variant='contained' onClick={() => setShowCreatePanel(true)}>
          New Chat
        </Button>
        {error && <div className='direct-message-error'>{error}</div>}
      </Box>
      <Modal open={showCreatePanel} onClose={handleClostModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}>
          <Typography variant='h5' sx={{ mb: 1, fontWeight: 'bold' }}>
            Select a User
          </Typography>
          <Autocomplete
            options={userList}
            getOptionLabel={(option: SafeDatabaseUser) => option.username}
            value={selectedUser}
            onChange={(event, newValue) => {
              if (newValue) {
                handleUserSelect(newValue);
                setSelectedUser(newValue);
              }
            }}
            renderInput={params => <TextField {...params} label='Search Users' />}
          />
          <Button
            variant='contained'
            sx={{ mt: 2 }}
            onClick={handleCreateChat}
            disabled={!selectedUser}>
            Start Chat
          </Button>
        </Box>
      </Modal>
      <div className='direct-message-container'>
        <div className='chats-list'>
          {chats.map(chat => (
            <ChatsListCard key={String(chat._id)} chat={chat} handleChatSelect={handleChatSelect} />
          ))}
        </div>
        <div className='chat-container'>
          {selectedChat ? (
            <>
              <h2>Chat Participants: {selectedChat.participants.join(', ')}</h2>
              <div className='chat-messages'>
                {selectedChat.messages.map(message => (
                  <MessageCard key={String(message._id)} message={message} />
                ))}
              </div>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <TextField
                  type='text'
                  size='small'
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder='Type a message...'
                  sx={{ flexGrow: 1, mr: 1 }}
                />
                <Button variant='contained' onClick={handleSendMessage} sx={{ boxShadow: 1 }}>
                  Send
                </Button>
              </Box>
            </>
          ) : (
            <h2>Select a user to start chatting</h2>
          )}
        </div>
      </div>
    </>
  );
};

export default DirectMessage;
