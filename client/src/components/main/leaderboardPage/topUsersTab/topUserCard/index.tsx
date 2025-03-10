import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';

import Box from '@mui/material/Box';
import { SafeDatabaseUser } from '@fake-stack-overflow/shared';

const TopUserCard = ({ user }: { user: Omit<SafeDatabaseUser, '_id'> }) => (
  <Box sx={{ p: 2, border: '1px dashed grey' }}>
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant='h5' component='div'>
          {user.username}
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
          Joined {user.dateJoined.toDateString()}
        </Typography>
        <Typography variant='body2'>
          Score, Awards, Rank, etc
          <br />
        </Typography>
      </CardContent>
      <CardActions>
        <Button size='small'>View User</Button>
      </CardActions>
    </Card>
  </Box>
);

export default TopUserCard;
