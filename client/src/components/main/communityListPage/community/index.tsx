import Card from '@mui/material/Card';
import { Box, Button, CardActions, CardContent, Typography } from '@mui/material';
import { ObjectId } from 'mongodb';
import OptionsMenu from './optionsMenu';
import LockIcon from '@mui/icons-material/Lock';
import { Chip, Divider, Stack } from '@mui/material';
import { DatabaseCommunity, Tag } from '../../../../types/types';

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
  communityTags: Tag[];
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
  communityTags,
}: CommunityProps) => (
  <Box>
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
            Community
          </Typography>
          {UserInCommunity && <OptionsMenu communityTitle={community.title} />}
          {community.isPrivate && !UserInCommunity ? <LockIcon color='primary' /> : null}
        </Box>
        <Typography variant='h5' component='div'>
          {community.title}
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>{community.description}</Typography>
        <Typography variant='body2'>
          {`${community.members.length + community.admins.length + community.moderators.length} members`}
        </Typography>
        <Typography variant='body2'>{community.questions.length} questions</Typography>
      </CardContent>
      {(community.isPrivate && UserInCommunity) || !community.isPrivate ? (
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
          {UserInCommunity ? (
            <Button onClick={() => handleViewCommunity(community._id)} size='small' color='primary'>
              View
            </Button>
          ) : null}
        </CardActions>
      ) : null}
      {communityTags.length > 0 && (
        <Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography gutterBottom variant='body2' sx={{ fontWeight: 'bold' }}>
              Tags
            </Typography>
            <Stack direction='row' sx={{ flexWrap: 'wrap' }}>
              {communityTags.map(tag => (
                <Chip key={tag.name} label={tag.name} size='small' sx={{ mr: 1, mt: 1 }} />
              ))}
            </Stack>
          </Box>
        </Box>
      )}
    </Card>
  </Box>
);

export default CommunityView;
