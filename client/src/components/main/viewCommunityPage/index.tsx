import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab } from '@mui/material';
import { useState } from 'react';
import CommunityHome from './communityHome';
import useViewCommunityPage from '../../../hooks/useViewCommunityPage';
import CommunityUsers from './communityUsers';
import useUserContext from '../../../hooks/useUserContext';

const ViewCommunityPage = () => {
  const {
    community,
    currentRole,
    handleTogglePinQuestion,
    handleRoleChange,
    handleAddUser,
    open,
    handleOpen,
    handleClose,
    userToAdd,
    handleSetUsername,
  } = useViewCommunityPage();
  const [value, setValue] = useState('1');

  const currentUser = useUserContext();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label='lab API tabs example'>
            <Tab label='Home' value='1' />
            <Tab label='Users' value='2' />
          </TabList>
        </Box>
        <TabPanel value='1'>
          <CommunityHome
            community={community}
            currentRole={currentRole}
            handleTogglePinQuestion={handleTogglePinQuestion}
          />
        </TabPanel>
        <TabPanel value='2'>
          <CommunityUsers
            communityID={community?._id}
            admins={community?.admins}
            moderators={community?.moderators}
            members={community?.members}
            userRole={currentRole.toString()}
            handleRoleChange={handleRoleChange}
            handleAddUser={handleAddUser}
            open={open}
            handleOpen={handleOpen}
            handleClose={handleClose}
            userToAdd={userToAdd}
            handleSetUsername={handleSetUsername}
            currentUser={currentUser.user}
          />
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default ViewCommunityPage;
