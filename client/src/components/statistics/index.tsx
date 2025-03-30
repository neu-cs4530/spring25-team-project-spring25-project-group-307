import './index.css';
import * as React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Typography,
  Box,
  Grid,
  Card,
  Tooltip,
} from '@mui/material';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CommentIcon from '@mui/icons-material/Comment';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import CelebrationIcon from '@mui/icons-material/Celebration';
import GamesIcon from '@mui/icons-material/Games';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StairsIcon from '@mui/icons-material/Stairs';
import StarPurple500Icon from '@mui/icons-material/StarPurple500';
import StarRateIcon from '@mui/icons-material/StarRate';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import LockIcon from '@mui/icons-material/Lock';
import useStatistics from '../../hooks/useStatistics';

// Define ranking tiers and score requirements for each rank
const RANKING_TIERS = [
  { rank: 'Newcomer Newbie', minScore: 0, maxScore: 49 },
  { rank: 'Common Contributor', minScore: 50, maxScore: 149 },
  { rank: 'Skilled Solver', minScore: 150, maxScore: 299 },
  { rank: 'Expert Explorer', minScore: 300, maxScore: 499 },
  { rank: 'Mentor Maven', minScore: 500, maxScore: 749 },
  { rank: 'Master Maverick', minScore: 750, maxScore: 1000 },
];

// Define all possible achievements and their requirements
const ACHIEVEMENTS_LIST = [
  { name: 'First Step', requirement: 'Post first question' },
  { name: 'Helpful Mind', requirement: 'Post first answer' },
  { name: 'Curious Thinker', requirement: 'Ask 5 questions' },
  { name: 'Problem Solver', requirement: 'Answer 5 questions' },
  { name: 'Audience Pleaser', requirement: 'Get 5 upvotes on an answer' },
  { name: 'Ambitious Reviewer', requirement: 'Give 10 upvotes on an answer' },
  { name: 'Community Favorite', requirement: 'Get 10 upvotes on a question' },
  { name: 'Ascension I', requirement: 'Reached Common Contributor' },
  { name: 'Ascension II', requirement: 'Reached Skilled Solver' },
  { name: 'Ascension III', requirement: 'Reached Expert Explorer' },
  { name: 'Ascension IV', requirement: 'Reached Mentor Maven' },
  { name: 'Ascension V', requirement: 'Reached Master Maverick' },
  { name: 'Nim Beginner', requirement: 'Win one game of Nim' },
  { name: 'Nim Novice', requirement: 'Win 5 games of Nim' },
  { name: 'Nim King', requirement: 'Win 25 games of Nim' },
];

const achievementIcons: Record<string, React.ReactElement> = {
  'First Step': <StairsIcon />,
  'Helpful Mind': <PsychologyAltIcon />,
  'Casual Talker': <CommentIcon />,
  'Curious Thinker': <EmojiObjectsIcon />,
  'Problem Solver': <CelebrationIcon />,
  'Acknowledged': <TaskAltIcon />,
  'Audience Pleaser': <ThumbUpIcon />,
  'Ambitious Reviewer': <HowToVoteIcon />,
  'Community Favorite': <FavoriteIcon />,
  'Ascension I': <StarBorderIcon />,
  'Ascension II': <StarPurple500Icon />,
  'Ascension III': <StarHalfIcon />,
  'Ascension IV': <StarRateIcon />,
  'Ascension V': <EmojiEventsIcon />,
  'Nim Beginner': <SportsEsportsIcon />,
  'Nim Novice': <GamesIcon />,
  'Nim King': <VideogameAssetIcon />,
};

// Get the user's progress percentage toward the next rank
const getProgress = (score: number) => {
  for (let i = 0; i < RANKING_TIERS.length - 1; i++) {
    if (score >= RANKING_TIERS[i].minScore && score <= RANKING_TIERS[i].maxScore) {
      return RANKING_TIERS[i].maxScore - score + 1;
    }
  }
  // if user is at the highest rank, it will just return 0
  return 0;
};

const StatisticsSettings: React.FC = () => {
  const { userData, loading } = useStatistics();
  const earnedAchievements = userData?.achievements ?? [];

  if (loading) {
    return (
      <div className='page-container'>
        <div className='profile-card'>
          <h2>Loading user data...</h2>
        </div>
      </div>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, px: 3 }}>
      <Grid container spacing={3} maxWidth='1200px'>
        {/* Left Side - User Statistics & Ranking Tiers */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
            <Typography variant='h5' gutterBottom>
              {userData?.username} statistics
            </Typography>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <MilitaryTechIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary='Rank' secondary={userData?.ranking} />
              </ListItem>

              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <StarIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary='Score' secondary={userData?.score} />
              </ListItem>

              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <QuestionAnswerIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary='Questions Asked' secondary={userData?.questionsAsked} />
              </ListItem>

              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <CommentIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary='Responses Given' secondary={userData?.responsesGiven} />
              </ListItem>
            </List>

            {/* Progress Indicator */}
            <Box mt={3} p={2} bgcolor='#f5f5f5' borderRadius={2}>
              <Typography variant='h6' gutterBottom>
                Rank Progress
              </Typography>
              <LinearProgress
                variant='determinate'
                value={Math.min((userData?.score ?? 0) / 10, 100)}
                sx={{ height: 8, borderRadius: 5 }}
              />
              <Typography variant='body2' align='center' mt={1}>
                {getProgress(userData?.score ?? 0) > 0
                  ? `Points needed for next rank: ${getProgress(userData?.score ?? 0)}`
                  : 'Max rank reached'}
              </Typography>
            </Box>

            {/* Ranking Tiers Table - Now Below Statistics */}
            <Typography variant='h6' align='center' gutterBottom sx={{ mt: 3 }}>
              Ranking Tiers
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>Rank</b>
                    </TableCell>
                    <TableCell>
                      <b>Score Range</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {RANKING_TIERS.map((tier, index) => (
                    <TableRow key={index} selected={userData?.ranking === tier.rank}>
                      <TableCell>{tier.rank}</TableCell>
                      <TableCell>
                        {tier.minScore} – {tier.maxScore === Infinity ? '∞' : tier.maxScore}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Right Side - Achievements List with Hover Tooltip */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
            <Typography variant='h6' align='center' gutterBottom>
              Achievements
            </Typography>
            <List>
              {ACHIEVEMENTS_LIST.map((achievement, index) => {
                const isEarned = earnedAchievements.includes(achievement.name);
                const icon = achievementIcons[achievement.name] || <EmojiEventsIcon />;

                return (
                  <Tooltip key={index} title={achievement.requirement} arrow>
                    <ListItem>
                      <ListItemAvatar>
                        <Box position='relative' display='inline-block'>
                          <Avatar
                            sx={{
                              bgcolor: isEarned ? 'primary.main' : 'grey.400',
                              color: isEarned ? 'white' : 'grey.700',
                              boxShadow: isEarned ? '0 0 6px #1976d2' : 'none',
                              transition: 'all 0.3s ease',
                            }}>
                            {icon}
                          </Avatar>
                          {!isEarned && (
                            <LockIcon
                              sx={{
                                position: 'absolute',
                                top: -4,
                                right: -4,
                                fontSize: 16,
                                color: 'grey.600',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                              }}
                            />
                          )}
                        </Box>
                      </ListItemAvatar>
                      <ListItemText
                        primary={achievement.name}
                        sx={{
                          color: isEarned ? 'text.primary' : 'text.disabled',
                        }}
                      />
                    </ListItem>
                  </Tooltip>
                );
              })}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatisticsSettings;
