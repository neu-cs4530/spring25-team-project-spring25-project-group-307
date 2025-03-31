import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { DatabaseTag, FeedItem } from '@fake-stack-overflow/shared';
import { useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';
import useUserContext from '../../../../hooks/useUserContext';
import { joinCommunity, leaveCommunity } from '../../../../services/communityService';

const RecommendedQuestionCard = ({ item }: { item: Omit<FeedItem, '_id'> }) => {
  const navigate = useNavigate();
  const viewQuestion = () => {
    if ('_id' in item.question) {
      navigate(`/question/${item.question._id}`);
    }
  };
  const { user } = useUserContext();

  const [isAlreadyJoined, setIsAlreadyJoined] = useState(false);

  useEffect(() => {
    if (item.community) {
      setIsAlreadyJoined(item.community.members.includes(user._id));
    }
  }, [item.community, user._id]);

  const handleJoin = async () => {
    try {
      if (item.community) {
        await joinCommunity(item.community.title, user.username);
        setIsAlreadyJoined(true);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error joining community:', error);
    }
  };

  const handleLeave = async () => {
    try {
      if (item.community) {
        await leaveCommunity(item.community.title, user.username);
        setIsAlreadyJoined(false);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error leaving community:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}>
      <Card
        onClick={viewQuestion}
        sx={{
          'minWidth': 275,
          'width': '50%',
          'p': 2,
          'border': '1px dashed grey',
          'cursor': 'pointer',
          'transition': 'background-color 0.3s ease',
          '&:hover': { backgroundColor: '#f5f5f5' },
        }}>
        <CardContent>
          {/* Header Section */}
          {item.community && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid lightgrey',
              }}>
              {/* Community Title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant='subtitle1' fontWeight='bold'>
                  {item.community.title}
                </Typography>
              </Box>
              {/* Buttons Group */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  onClick={event => {
                    event.stopPropagation();
                    navigate(`/community/${item.community._id}`);
                  }}
                  variant='contained'
                  size='small'
                  sx={{ borderRadius: 20 }}
                  disabled={item.community.isPublic}>
                  View
                </Button>
                <Button
                  onClick={event => {
                    event.stopPropagation();
                    if (item.community) {
                      if (isAlreadyJoined) {
                        handleLeave();
                      } else {
                        handleJoin();
                      }
                    }
                  }}
                  variant='contained'
                  size='small'
                  sx={{
                    'borderRadius': 20,
                    'backgroundColor': isAlreadyJoined ? 'error.main' : 'primary.main',
                    '&:hover': {
                      backgroundColor: isAlreadyJoined ? 'error.dark' : 'primary.dark',
                    },
                  }}>
                  {isAlreadyJoined ? 'Leave' : 'Join'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Card Content */}
          <Typography sx={{ mt: 1.5 }} variant='h5' component='div'>
            {item.question.title}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            {item.question.askDateTime.toLocaleString()}
          </Typography>
          <Typography variant='body2'>
            {item.question.text}
            <br />
          </Typography>
        </CardContent>
        <CardActions>
          <Button size='small'>View Post</Button>
        </CardActions>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {item.question.tags.map((tag: DatabaseTag) => (
            <Box
              key={tag._id.toString()}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#ebedef',
                borderRadius: '20px',
                px: 2,
                py: 0.5,
                width: 'auto',
              }}>
              <Typography variant='body2'>{tag.name}</Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
};

export default RecommendedQuestionCard;
