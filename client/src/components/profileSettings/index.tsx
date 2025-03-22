import React from 'react';
import './index.css';
import { Chip, Grid2 } from '@mui/material';
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
      <div className='page-container'>
        <div className='profile-card'>
          <h2>Loading user data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className='page-container'>
      <div className='profile-card'>
        <h2>Profile</h2>
        {successMessage && <p className='success-message'>{successMessage}</p>}
        {errorMessage && <p className='error-message'>{errorMessage}</p>}
        {userData ? (
          <>
            <h4>General Information</h4>
            <p>
              <strong>Username:</strong> {userData.username}
            </p>

            {/* ---- Biography Section ---- */}
            {!editBioMode && (
              <p>
                <strong>Biography:</strong> {userData.biography || 'No biography yet.'}
                {canEditProfile && (
                  <button
                    className='login-button'
                    style={{ marginLeft: '1rem' }}
                    onClick={() => {
                      setEditBioMode(true);
                      setNewBio(userData.biography || '');
                    }}>
                    Edit
                  </button>
                )}
              </p>
            )}

            {editBioMode && canEditProfile && (
              <div style={{ margin: '1rem 0' }}>
                <input
                  className='input-text'
                  type='text'
                  value={newBio}
                  onChange={e => setNewBio(e.target.value)}
                />
                <button
                  className='login-button'
                  style={{ marginLeft: '1rem' }}
                  onClick={handleUpdateBiography}>
                  Save
                </button>
                <button
                  className='delete-button'
                  style={{ marginLeft: '1rem' }}
                  onClick={() => setEditBioMode(false)}>
                  Cancel
                </button>
              </div>
            )}

            <p>
              <strong>Date Joined:</strong>{' '}
              {userData.dateJoined ? new Date(userData.dateJoined).toLocaleDateString() : 'N/A'}
            </p>

            {/* ---- Interests Section ---- */}
            {!editInterestsMode && (
              <div>
                <h4>Interests</h4>
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
                                interest.userId === userData._id && interest.tagId === tag._id,
                            )
                          ) {
                            setNewInterests(
                              newInterests.filter(
                                interest =>
                                  interest.userId === userData._id && interest.tagId !== tag._id,
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
                                interest.userId === userData._id && interest.tagId === tag._id,
                            )
                              ? newInterests.filter(
                                  interest =>
                                    interest.userId === userData._id && interest.tagId !== tag._id,
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

            {/* ---- Reset Password Section ---- */}
            {canEditProfile && (
              <>
                <h4>Reset Password</h4>
                <input
                  className='input-text'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='New Password'
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <input
                  className='input-text'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Confirm New Password'
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                />
                <button className='toggle-password-button' onClick={togglePasswordVisibility}>
                  {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                </button>
                <button className='login-button' onClick={handleResetPassword}>
                  Reset
                </button>
              </>
            )}

            {/* ---- Danger Zone (Delete User) ---- */}
            {canEditProfile && (
              <>
                <h4>Danger Zone</h4>
                <button className='delete-button' onClick={handleDeleteUser}>
                  Delete This User
                </button>
              </>
            )}
          </>
        ) : (
          <p>No user data found. Make sure the username parameter is correct.</p>
        )}

        {/* ---- Confirmation Modal for Delete ---- */}
        {showConfirmation && (
          <div className='modal'>
            <div className='modal-content'>
              <p>
                Are you sure you want to delete user <strong>{userData?.username}</strong>? This
                action cannot be undone.
              </p>
              <button className='delete-button' onClick={() => pendingAction && pendingAction()}>
                Confirm
              </button>
              <button className='cancel-button' onClick={() => setShowConfirmation(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
