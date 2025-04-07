import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import { Box, Typography } from '@mui/material';
import TopUserCard from './topUserCard';

interface TopUsersTabProps {
  users: Omit<SafeDatabaseUser, '_id'>[];
}

const TopUsersTab = ({ users }: TopUsersTabProps) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2 }}>
    <Typography variant='h5' fontWeight='bold' sx={{ my: 2 }}>
      Browse HuskyFlow’s Top Users
    </Typography>
    <Box sx={{ width: '100%', maxWidth: '1100px' }}>
      {users.map((user, index) => (
        <TopUserCard key={user.username} user={user} index={index + 1} />
      ))}
    </Box>
  </Box>
);

export default TopUsersTab;
