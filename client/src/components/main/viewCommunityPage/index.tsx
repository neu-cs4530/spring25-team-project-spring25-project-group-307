import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab } from '@mui/material';
import { useState } from 'react';
import CommunityHome from './communityHome';
import useViewCommunityPage from '../../../hooks/useViewCommunityPage';

const ViewCommunityPage = () => {
  const { community } = useViewCommunityPage();
  const [value, setValue] = useState('1');

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
          <CommunityHome community={community} />
        </TabPanel>
        <TabPanel value='2'>Users</TabPanel>
      </TabContext>
    </Box>
  );
};

export default ViewCommunityPage;
