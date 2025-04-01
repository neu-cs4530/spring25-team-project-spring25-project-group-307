// components/AchievementSnackbar.tsx
import { Snackbar, Alert } from '@mui/material';
import { useAchievement } from '../../../contexts/AchievementContext';

const AchievementSnackbar = () => {
  const { achievement } = useAchievement();

  return (
    <Snackbar
      open={!!achievement}
      autoHideDuration={4000}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert severity='success' variant='filled'>
        🎉 Achievement Unlocked: <strong>{achievement}</strong>
      </Alert>
    </Snackbar>
  );
};

export default AchievementSnackbar;
