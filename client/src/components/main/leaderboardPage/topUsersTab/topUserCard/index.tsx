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
import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';

interface TopUserCardProps {
  user: Omit<SafeDatabaseUser, '_id'>;
  index: number;
}

const TopUserCard = ({ user, index }: TopUserCardProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const getMedalColor = () => {
    if (index === 1) return '#FFD700'; // Gold
    if (index === 2) return '#C0C0C0'; // Silver
    if (index === 3) return '#CD7F32'; // Bronze
    return theme.palette.grey[300]; // Neutral for 4th+
  };

  const medalColor = getMedalColor();

  const handleViewProfile = () => {
    navigate(`/user/${user.username}`);
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

          {/* Username */}
          <Grid item xs={12} sm={2}>
            <Typography variant='h6' fontWeight='bold'>
              {user.username}
            </Typography>
          </Grid>

          {/* Score */}
          <Grid item xs={12} sm={2}>
            <Typography variant='body1'>
              <strong>Score:</strong> {user.score}
            </Typography>
          </Grid>

          {/* Rank */}
          <Grid item xs={12} sm={3}>
            <Typography variant='body1'>
              <strong>Rank:</strong> {user.ranking}
            </Typography>
          </Grid>

          {/* Last Online */}
          <Grid item xs={12} sm={2}>
            <Typography variant='body1'>
              <strong>Last Online:</strong>{' '}
              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>

          {/* View Profile Button */}
          <Grid item xs={12} sm={1}>
            <Button
              variant='outlined'
              size='small'
              onClick={handleViewProfile}
              sx={{
                textTransform: 'none',
                whiteSpace: 'nowrap',
                minWidth: '120px',
                px: 2,
                py: 1,
                fontWeight: 500,
              }}>
              View Profile
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TopUserCard;
