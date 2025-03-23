import Card from '@mui/material/Card';
import { Button, CardActions, CardContent, Typography } from '@mui/material';
import { ObjectId } from 'mongodb';
import { DatabaseCommunity } from '../../../../types/types';

/**
 * Interface representing the props for the Community component.
 *
 * community - The community object containing details about the community.
 */
interface CommunityProps {
  community: DatabaseCommunity;
  handleViewCommunity: (cid: ObjectId) => void;
  handleJoinCommunity: (title: string) => void;
  handleLeaveCommunity: (title: string) => void;
  UserInCommunity: boolean;
}

/**
 * Community component renders the details of a community including its title, description, members, and questions.
 *
 * @param community - The community object containing community details.
 */
const CommunityView = ({
  community,
  handleViewCommunity,
  handleJoinCommunity,
  handleLeaveCommunity,
  UserInCommunity,
}: CommunityProps) => (
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
          <Typography variant='body2'>
            {`${community.members.length + community.admins.length + community.moderators.length} members`}
          </Typography>
          <Typography variant='body2'>{community.questions.length} questions</Typography>
        </CardContent>
        <CardActions>
          {UserInCommunity ? (
            <Button
              onClick={() => handleLeaveCommunity(community.title)}
              size='small'
              color='error'>
              Leave
            </Button>
          ) : (
            <Button
              onClick={() => handleJoinCommunity(community.title)}
              size='small'
              color='primary'>
              Join
            </Button>
          )}
          <Button onClick={() => handleViewCommunity(community._id)} size='small' color='primary'>
            View
          </Button>
        </CardActions>
      </Card>
    </div>
  </div>
);

export default CommunityView;
