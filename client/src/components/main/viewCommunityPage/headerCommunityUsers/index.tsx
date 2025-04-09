import { Autocomplete, Box, Button, Modal, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import { getUsers } from '../../../../services/userService';

interface HeaderCommunityUsersProps {
  // Add props here
  handleAddUser: () => void;
  open: boolean;
  handleOpen: () => void;
  handleClose: () => void;
  userToAdd: string;
  handleSetUsername: (username: string) => void;
  communityUsers: SafeDatabaseUser[];
}

const HeaderCommunityUsers = ({
  handleAddUser,
  open,
  handleOpen,
  handleClose,
  userToAdd,
  handleSetUsername,
  communityUsers,
}: HeaderCommunityUsersProps) => {
  const [filteredUsers, setFilteredUsers] = useState<SafeDatabaseUser[]>([]);

  // fetch all users from the database on first render
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getUsers();

        // Filter out community users from all users
        const communityUserIds = communityUsers.map(user => user._id);
        const filtered = allUsers.filter(user => !communityUserIds.includes(user._id));
        setFilteredUsers(filtered);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [communityUsers]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant='h3'>Community Members</Typography>
      <Button variant='contained' color='primary' onClick={handleOpen}>
        Add Member
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'auto',
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
          }}>
          <Typography id='modal-modal-title' variant='h6' component='h2' sx={{ mb: 2 }}>
            Add a User
          </Typography>
          <Autocomplete
            options={filteredUsers.map(user => user.username)}
            value={userToAdd}
            onChange={(event, newValue) => {
              handleSetUsername(newValue || '');
            }}
            renderInput={params => (
              <TextField {...params} label='Select a user' variant='outlined' />
            )}
            sx={{ width: '200px' }}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleAddUser}>Add</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default HeaderCommunityUsers;
