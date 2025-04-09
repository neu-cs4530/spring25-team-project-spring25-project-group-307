import {
  Box,
  Button,
  CardActions,
  CardContent,
  Typography,
  Card,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import { ObjectId } from 'mongodb';
import LockIcon from '@mui/icons-material/Lock';
import OptionsMenu from './optionsMenu';

import { DatabaseCommunity, Tag } from '../../../../types/types';

/**
 * Interface representing the props for the Community component.
 *
 * community - The community object containing details about the community.
 */
interface CommunityProps {
  community: DatabaseCommunity;
  handleViewCommunity: (event: React.MouseEvent, cid: ObjectId) => void;
  handleJoinCommunity: (event: React.MouseEvent, title: string) => void;
  handleLeaveCommunity: (event: React.MouseEvent, title: string) => void;
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
  <Card
    onClick={e =>
      community.isPrivate && !UserInCommunity ? null : handleViewCommunity(e, community._id)
    }
    className='content_background'
    sx={{
      'cursor': community.isPrivate && !UserInCommunity ? 'default' : 'pointer',
      'borderRadius': '10px',
      '&:hover': {
        backgroundColor: community.isPrivate && !UserInCommunity ? 'none' : '#F7F7F7',
      },
      'opacity': community.isPrivate && !UserInCommunity ? 0.8 : 1,
      'boxShadow': 2,
    }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography gutterBottom sx={{ p: 1, color: 'text.secondary', fontSize: 14 }}>
          Community
        </Typography>
        {UserInCommunity && <OptionsMenu communityTitle={community.title} />}
        {community.isPrivate && !UserInCommunity ? <LockIcon color='primary' /> : null}
      </Box>
      <Typography variant='h5' component='div'>
        {community.title}
      </Typography>
      <Typography
        sx={{
          color: 'text.secondary',
          mb: 1.5,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}>
        {community.description}
      </Typography>
      <Typography variant='body2'>
        {`${community.members.length + community.admins.length + community.moderators.length} members`}
      </Typography>
      <Typography variant='body2'>{community.questions.length} questions</Typography>
    </CardContent>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
      }}>
      {(community.isPrivate && UserInCommunity) || !community.isPrivate ? (
        <CardActions>
          {UserInCommunity ? (
            <Button
              onClick={e => handleLeaveCommunity(e, community.title)}
              size='small'
              color='error'>
              Leave
            </Button>
          ) : (
            <Button
              onClick={e => handleJoinCommunity(e, community.title)}
              size='small'
              color='primary'>
              Join
            </Button>
          )}
          <Button onClick={e => handleViewCommunity(e, community._id)} size='small' color='primary'>
            View
          </Button>
        </CardActions>
      ) : (
        <Box></Box>
      )}
      {communityTags.length > 0 && (
        <Stack direction='row' sx={{ flexWrap: 'nowrap', overflow: 'hidden', mb: 2, mr: 2 }}>
          {communityTags.slice(0, 2).map(tag => (
            <Chip
              key={tag.name}
              label={tag.name}
              size='small'
              sx={{ mr: 1, mt: 1, whiteSpace: 'nowrap' }}
            />
          ))}
          {communityTags.length > 2 && (
            <Tooltip
              title={communityTags
                .slice(2)
                .map(tag => tag.name)
                .join(', ')}
              arrow>
              <Chip
                label={`+${communityTags.length - 2} more`}
                size='small'
                sx={{ mr: 1, mt: 1 }}
              />
            </Tooltip>
          )}
        </Stack>
      )}
    </Box>
  </Card>
);

export default CommunityView;
