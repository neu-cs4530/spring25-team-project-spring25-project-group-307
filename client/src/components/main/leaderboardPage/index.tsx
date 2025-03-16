import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import CircularProgress from '@mui/material/CircularProgress';

import { useState } from 'react';
import TopCommunitiesTab from './topCommunitiesTab';
import TopUsersTab from './topUsersTab';
import useLeaderboardPage from '../../../hooks/useLeaderboardPage';

const LeaderboardPage = () => {
  const [tabNumber, setTabNumber] = useState('1');
  const { communities, isCommunitiesLoading, topUsers, istopUsersLoading } = useLeaderboardPage();

  const changeTab = (event: React.SyntheticEvent, newValue: string) => {
    setTabNumber(newValue);
  };

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={tabNumber}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={changeTab}>
            <Tab label='Top Communities' value='1' />
            <Tab label='Top Users' value='2' />
          </TabList>
        </Box>
        <TabPanel value='1'>
          {isCommunitiesLoading ? (
            <Box display='flex' justifyContent='center' alignItems='center'>
              <CircularProgress />
            </Box>
          ) : (
            <TopCommunitiesTab communities={communities} />
          )}
        </TabPanel>
        <TabPanel value='2'>
          {istopUsersLoading ? (
            <Box display='flex' justifyContent='center' alignItems='center'>
              <CircularProgress />
            </Box>
          ) : (
            <TopUsersTab users={topUsers} />
          )}
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default LeaderboardPage;
