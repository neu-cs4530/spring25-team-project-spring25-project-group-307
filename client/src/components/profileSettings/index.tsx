import React from 'react';
import './index.css';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Chip,
  Grid2,
  Grid,
  Typography,
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
    editInterestsMode,
    newInterests,
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

    setEditInterestsMode,
    setNewInterests,
    populatedTags,
    allTags,
    getTagColor,

    handleResetPassword,
    handleUpdateBiography,
    handleUpdateInterests,
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
              <Typography variant='h5' gutterBottom sx={{ fontWeight: 'bold' }}>
                Profile Settings
              </Typography>

              {successMessage && <Typography color='success.main'>{successMessage}</Typography>}
              {errorMessage && <Typography color='error.main'>{errorMessage}</Typography>}

              {userData ? (
                <>
                  {/* ---- General Information ---- */}
                  <Typography variant='h6' mt={2} sx={{ fontWeight: 'bold' }}>
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
                  <Typography>
                    <strong>Last Online:</strong>{' '}
                    {userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'N/A'}
                  </Typography>

                  {/* ---- Biography Section ---- */}
                  <Box mt={2}>
                    <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                      Biography
                    </Typography>
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

                  {/* ---- Interests Section ---- */}
                  {!editInterestsMode && (
                    <div>
                      <Typography variant='h6' mt={2} sx={{ fontWeight: 'bold' }}>
                        Interests
                      </Typography>
                      <Grid2 container spacing={1}>
                        {populatedTags.map(tag => (
                          <Grid2 key={tag._id.toString()}>
                            <Chip label={tag.name} />
                          </Grid2>
                        ))}
                      </Grid2>
                      {canEditProfile && (
                        <button
                          className='login-button'
                          style={{ marginLeft: '1rem' }}
                          onClick={() => {
                            setEditInterestsMode(true);
                          }}>
                          Edit
                        </button>
                      )}
                    </div>
                  )}
                  {editInterestsMode && canEditProfile && (
                    <div>
                      <h4>Edit Interests</h4>
                      <Grid2 container spacing={1}>
                        {allTags.map(tag => (
                          <Grid2 key={tag._id.toString()}>
                            <Chip
                              label={tag.name}
                              clickable
                              color={getTagColor(tag)}
                              onClick={() => {
                                if (
                                  newInterests.some(
                                    interest =>
                                      interest.userId === userData._id &&
                                      interest.tagId === tag._id,
                                  )
                                ) {
                                  setNewInterests(
                                    newInterests.filter(
                                      interest =>
                                        interest.userId === userData._id &&
                                        interest.tagId !== tag._id,
                                    ),
                                  );
                                } else {
                                  setNewInterests([
                                    ...newInterests,
                                    {
                                      userId: userData._id,
                                      tagId: tag._id,
                                      weight: 1,
                                      priority: 'moderate',
                                    },
                                  ]);
                                }
                              }}
                              onContextMenu={e => {
                                e.preventDefault();
                                setNewInterests(
                                  newInterests.some(
                                    interest =>
                                      interest.userId === userData._id &&
                                      interest.tagId === tag._id,
                                  )
                                    ? newInterests.filter(
                                        interest =>
                                          interest.userId === userData._id &&
                                          interest.tagId !== tag._id,
                                      )
                                    : [
                                        ...newInterests,
                                        {
                                          userId: userData._id,
                                          tagId: tag._id,
                                          weight: 2,
                                          priority: 'high',
                                        },
                                      ],
                                );
                              }}
                            />
                          </Grid2>
                        ))}
                      </Grid2>
                      <div style={{ marginTop: '1rem' }}>
                        <button className='login-button' onClick={handleUpdateInterests}>
                          Save
                        </button>
                        <button
                          className='delete-button'
                          style={{ marginLeft: '1rem' }}
                          onClick={() => setEditInterestsMode(false)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {/* ---- User Statistics ---- */}
                  <Box mt={3}>
                    <Typography variant='h6' mt={2} sx={{ fontWeight: 'bold' }}>
                      {userData?.username} statistics
                    </Typography>
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
                      <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                        Reset Password
                      </Typography>
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
                      <Typography variant='h6' color='error' sx={{ fontWeight: 'bold' }}>
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
                <Box
                  className='modal'
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    bgcolor: 'rgba(0,0,0,0.3)', // optional dark overlay
                    zIndex: 1300, // above other content
                  }}>
                  <Box
                    className='modal-content'
                    p={3}
                    boxShadow={3}
                    bgcolor='white'
                    borderRadius={2}
                    minWidth='400px'
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}>
                    <Typography>
                      Are you sure you want to delete user <strong>{userData?.username}</strong>?
                      <br />
                      This action cannot be undone.
                    </Typography>

                    <Box display='flex' justifyContent='center' gap={2} mt={3}>
                      <Button
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
