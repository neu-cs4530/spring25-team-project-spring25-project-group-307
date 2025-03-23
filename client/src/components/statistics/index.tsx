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
import useStatistics from '../../hooks/useStatistics';

// Define ranking tiers and score requirements
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
  { name: 'Casual Talker', requirement: 'Post first post' },
  { name: 'Curious Thinker', requirement: 'Ask 5 questions' },
  { name: 'Problem Solver', requirement: 'Answer 5 questions' },
  { name: 'Acknowledged', requirement: 'First answer accepted' },
  { name: 'Audience Pleaser', requirement: 'Get 5 upvotes on an answer' },
  { name: 'Review', requirement: 'Give 10 upvotes' },
  { name: 'Community Favorite', requirement: 'Get 10 upvotes on a question/post' },
  { name: 'Ascension I', requirement: 'Reached Common Contributor' },
  { name: 'Ascension II', requirement: 'Reached Skilled Solver' },
  { name: 'Ascension III', requirement: 'Reached Expert Explorer' },
  { name: 'Ascension IV', requirement: 'Reached Mentor Maven' },
  { name: 'Ascension V', requirement: 'Reached Master Maverick' },
  { name: 'Blackjack Beginner', requirement: 'Win one game of blackjack' },
  { name: 'Blackjack Novice', requirement: 'Win 5 games of blackjack' },
  { name: 'Blackjack King', requirement: 'Win 25 games of blackjack' },
  { name: 'Nim Beginner', requirement: 'Win one game of Nim' },
  { name: 'Nim Novice', requirement: 'Win 5 games of Nim' },
  { name: 'Nim King', requirement: 'Win 25 games of Nim' },
];

// Get the user's progress percentage toward the next rank
const getProgress = (score: number) => {
  for (let i = 0; i < RANKING_TIERS.length - 1; i++) {
    if (score >= RANKING_TIERS[i].minScore && score < RANKING_TIERS[i].maxScore) {
      return RANKING_TIERS[i].maxScore - score; // Points needed for the next rank
    }
  }
  return 0; // Already at the highest rank
};

const StatisticsSettings: React.FC = () => {
  const { userData, loading, questionsAsked, responsesGiven } = useStatistics();

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
                <ListItemText primary='Questions Asked' secondary={questionsAsked} />
              </ListItem>

              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <CommentIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary='Responses Given' secondary={responsesGiven} />
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
              {ACHIEVEMENTS_LIST.map((achievement, index) => (
                <Tooltip key={index} title={achievement.requirement} arrow>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'gray' }}>
                        <EmojiEventsIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={achievement.name} />
                  </ListItem>
                </Tooltip>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatisticsSettings;
