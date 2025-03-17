import Card from '@mui/material/Card';
import { Button, CardActions, CardContent, Typography } from '@mui/material';
import { DatabaseCommunity } from '../../../../types/types';

/**
 * Interface representing the props for the Community component.
 *
 * community - The community object containing details about the community.
 */
interface CommunityProps {
  community: DatabaseCommunity;
  handleJoinCommunity: (title: string) => void;
}

/**
 * Community component renders the details of a community including its title, description, members, and questions.
 *
 * @param community - The community object containing community details.
 */
const CommunityView = ({ community, handleJoinCommunity }: CommunityProps) => (
  <div>
    <div>
      <Card>
        <CardContent>
          <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
            Community
          </Typography>
          <Typography variant='h5' component='div'>
            {community.title}
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>{community.description}</Typography>
          <Typography variant='body2'>{community.members.length} members</Typography>
          <Typography variant='body2'>{community.questions.length} questions</Typography>
        </CardContent>
        <CardActions>
          <Button onClick={() => handleJoinCommunity(community.title)} size='small'>
            Join
          </Button>
          <Button size='small'>View</Button>
        </CardActions>
      </Card>
    </div>
  </div>
);

export default CommunityView;
