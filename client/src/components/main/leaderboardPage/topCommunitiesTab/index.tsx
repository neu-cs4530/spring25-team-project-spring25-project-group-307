import { Box, Typography } from '@mui/material';
import { Community } from '../../../../types/community';
import TopCommunityCard from './topCommunityCard';

const TopCommunitiesTab = ({ communities }: { communities: Community[] }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2 }}>
    <Typography variant='h5' fontWeight='bold' sx={{ my: 2 }}>
      Browse HuskyFlow’s Largest Communities
    </Typography>
    <Box sx={{ width: '100%', maxWidth: '900px' }}>
      {communities.map((community, index) => (
        <TopCommunityCard key={community._id} community={community} index={index + 1} />
      ))}
    </Box>
  </Box>
);

export default TopCommunitiesTab;
