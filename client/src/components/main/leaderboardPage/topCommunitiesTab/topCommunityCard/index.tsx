import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Community } from '../../../../../types/community';

const TopCommunityCard = ({ community }: { community: Community }) => (
  <Box sx={{ p: 2, border: '1px dashed grey' }}>
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant='h5' component='div'>
          {community.title}
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
          {community.members.length} members
        </Typography>
        <Typography variant='body2'>
          {community.description}
          <br />
        </Typography>
      </CardContent>
      <CardActions>
        <Button size='small'>View Community</Button>
      </CardActions>
    </Card>
  </Box>
);

export default TopCommunityCard;
