import { Box, Button, Modal, TextField, Typography } from '@mui/material';

interface HeaderCommunityUsersProps {
  // Add props here
  handleAddUser: () => void;
  open: boolean;
  handleOpen: () => void;
  handleClose: () => void;
  userToAdd: string;
  handleSetUsername: (username: string) => void;
}

const HeaderCommunityUsers = ({
  handleAddUser,
  open,
  handleOpen,
  handleClose,
  userToAdd,
  handleSetUsername,
}: HeaderCommunityUsersProps) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant='h3'>Community Members</Typography>
    <Button variant='contained' color='primary' onClick={handleOpen}>
      Add User
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
        <TextField
          id='standard-basic'
          label='Username'
          value={userToAdd}
          onChange={e => handleSetUsername(e.target.value)}
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddUser}>Add</Button>
        </Box>
      </Box>
    </Modal>
  </Box>
);

export default HeaderCommunityUsers;
