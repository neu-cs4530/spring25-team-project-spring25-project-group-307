import React from 'react';
import './index.css';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CommentIcon from '@mui/icons-material/Comment';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
} from '@mui/material';
import useProfileSettings from '../../hooks/useProfileSettings';

const ProfileSettings: React.FC = () => {
  const {
    userData,
    loading,
    editBioMode,
    newBio,
    newPassword,
    confirmNewPassword,
    successMessage,
    errorMessage,
    showConfirmation,
    pendingAction,
    canEditProfile,
    showPassword,
    togglePasswordVisibility,

    setEditBioMode,
    setNewBio,
    setNewPassword,
    setConfirmNewPassword,
    setShowConfirmation,

    handleResetPassword,
    handleUpdateBiography,
    handleDeleteUser,
  } = useProfileSettings();

  if (loading) {
    return (
      <Box className='page-container'>
        <Card className='profile-card'>
          <Typography variant='h6'>Loading user data...</Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      className='page-container'
      sx={{ display: 'flex', justifyContent: 'center', mt: 4, px: 3 }}>
      <Grid container spacing={3} maxWidth='900px'>
        <Grid item xs={12}>
          <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant='h5' gutterBottom>
                Profile Settings
              </Typography>

              {successMessage && <Typography color='success.main'>{successMessage}</Typography>}
              {errorMessage && <Typography color='error.main'>{errorMessage}</Typography>}

              {userData ? (
                <>
                  {/* ---- General Information ---- */}
                  <Typography variant='h6' mt={2}>
                    General Information
                  </Typography>
                  <Typography>
                    <strong>Username:</strong> {userData.username}
                  </Typography>
                  <Typography>
                    <strong>Date Joined:</strong>{' '}
                    {userData.dateJoined
                      ? new Date(userData.dateJoined).toLocaleDateString()
                      : 'N/A'}
                  </Typography>

                  {/* ---- Biography Section ---- */}
                  <Box mt={2}>
                    <Typography variant='h6'>Biography</Typography>
                    {!editBioMode ? (
                      <Typography>
                        {userData.biography || 'No biography yet.'}
                        {canEditProfile && (
                          <Button
                            sx={{ ml: 2 }}
                            variant='outlined'
                            size='small'
                            onClick={() => setEditBioMode(true)}>
                            Edit
                          </Button>
                        )}
                      </Typography>
                    ) : (
                      <Box mt={1} display='flex'>
                        <TextField
                          fullWidth
                          variant='outlined'
                          size='small'
                          value={newBio}
                          onChange={e => setNewBio(e.target.value)}
                        />
                        <Button
                          sx={{ ml: 2 }}
                          variant='contained'
                          color='primary'
                          onClick={handleUpdateBiography}>
                          Save
                        </Button>
                        <Button
                          sx={{ ml: 1 }}
                          variant='outlined'
                          color='secondary'
                          onClick={() => setEditBioMode(false)}>
                          Cancel
                        </Button>
                      </Box>
                    )}
                  </Box>

                  {/* ---- User Statistics ---- */}
                  <Box mt={3}>
                    <Typography variant='h6'>{userData?.username} statistics</Typography>
                    <List>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <MilitaryTechIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary='Rank' secondary={userData.ranking} />
                      </ListItem>

                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <EmojiEventsIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary='Achievements'
                          secondary={
                            userData.achievements.length > 0
                              ? userData.achievements.join(', ')
                              : 'No achievements found.'
                          }
                        />
                      </ListItem>
                    </List>
                  </Box>

                  {/* ---- Reset Password Section ---- */}
                  {canEditProfile && (
                    <Box mt={3}>
                      <Typography variant='h6'>Reset Password</Typography>
                      <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        placeholder='New Password'
                        variant='outlined'
                        size='small'
                        sx={{ my: 1 }}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                      <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Confirm New Password'
                        variant='outlined'
                        size='small'
                        sx={{ my: 1 }}
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                      />
                      <Button variant='outlined' sx={{ mr: 1 }} onClick={togglePasswordVisibility}>
                        {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                      </Button>
                      <Button variant='contained' color='primary' onClick={handleResetPassword}>
                        Reset
                      </Button>
                    </Box>
                  )}

                  {/* ---- Danger Zone (Delete User) ---- */}
                  {canEditProfile && (
                    <Box mt={4}>
                      <Typography variant='h6' color='error'>
                        Danger Zone
                      </Typography>
                      <Button variant='contained' color='error' onClick={handleDeleteUser}>
                        Delete This User
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <Typography>
                  No user data found. Make sure the username parameter is correct.
                </Typography>
              )}

              {/* ---- Confirmation Modal for Delete ---- */}
              {showConfirmation && (
                <Box className='modal'>
                  <Box
                    className='modal-content'
                    p={3}
                    boxShadow={3}
                    bgcolor='white'
                    borderRadius={2}>
                    <Typography>
                      Are you sure you want to delete user <strong>{userData?.username}</strong>?
                      This action cannot be undone.
                    </Typography>
                    <Button
                      sx={{ mt: 2, mr: 1 }}
                      variant='contained'
                      color='error'
                      onClick={() => pendingAction && pendingAction()}>
                      Confirm
                    </Button>
                    <Button variant='outlined' onClick={() => setShowConfirmation(false)}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileSettings;
