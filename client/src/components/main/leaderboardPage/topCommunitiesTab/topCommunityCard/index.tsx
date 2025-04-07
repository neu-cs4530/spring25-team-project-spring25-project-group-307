import {
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  useTheme,
  Tooltip,
  Button,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';
import { Community } from '../../../../../types/community';

interface TopCommunityCardProps {
  community: Community;
  index: number;
}

const TopCommunityCard = ({ community, index }: TopCommunityCardProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const getMedalColor = () => {
    if (index === 1) return '#FFD700'; // Gold
    if (index === 2) return '#C0C0C0'; // Silver
    if (index === 3) return '#CD7F32'; // Bronze
    return theme.palette.grey[300]; // Neutral
  };

  const medalColor = getMedalColor();
  const totalMembers =
    community.members.length + community.admins.length + community.moderators.length;

  const handleViewCommunity = () => {
    navigate(`/community/${community._id}`);
  };

  return (
    <Card
      elevation={3}
      sx={{
        my: 2,
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper,
        px: 2,
      }}>
      <CardContent>
        <Grid container alignItems='center' spacing={2}>
          {/* Rank Badge */}
          <Grid item>
            <Tooltip title={`Top #${index}`}>
              <Avatar
                sx={{
                  bgcolor: medalColor,
                  width: 48,
                  height: 48,
                  fontSize: index > 3 ? '1rem' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {index <= 3 ? (
                  <EmojiEventsIcon sx={{ color: 'black' }} />
                ) : (
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    {index}
                  </Typography>
                )}
              </Avatar>
            </Tooltip>
          </Grid>

          {/* Title & Description */}
          <Grid item xs={12} sm={4}>
            <Typography variant='h6' fontWeight='bold'>
              {community.title}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {community.description}
            </Typography>
          </Grid>

          {/* Member Count */}
          <Grid item xs={12} sm={3}>
            <Typography variant='body1'>
              <strong>Members:</strong> {totalMembers}
            </Typography>
          </Grid>

          {/* View Community Button */}
          <Grid item xs={12} sm={2}>
            <Button
              variant='outlined'
              size='small'
              onClick={handleViewCommunity}
              sx={{ textTransform: 'none' }}>
              View Community
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TopCommunityCard;
