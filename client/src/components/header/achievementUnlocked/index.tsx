import { Snackbar, Alert } from '@mui/material';
import { useAchievement } from '../../../contexts/AchievementContext';

const AchievementSnackbar = () => {
  const { achievement } = useAchievement();

  if (!achievement) return null;

  const isRankAchievement = achievement.includes('Ascension');

  return (
    <Snackbar
      open={!!achievement}
      autoHideDuration={4000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
      <Alert severity='success'>
        🎉 Achievement Unlocked: <strong>{achievement}</strong>
        {isRankAchievement && (
          <>
            <br />
            🔼 <strong>Rank Increase!</strong>
          </>
        )}
      </Alert>
    </Snackbar>
  );
};

export default AchievementSnackbar;
