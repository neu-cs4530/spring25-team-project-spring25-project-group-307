import { Badge, Box, Divider, IconButton, Link, Menu, MenuItem, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState } from 'react';

export interface NotificationMenuItem {
  message: string;
}
const Notifications = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<NotificationMenuItem[]>([
    { message: 'This is a test notification' },
  ]);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClear = () => {
    setNotifications([]);
    handleClose();
  };
  return (
    <>
      <IconButton onClick={handleClick} color='inherit'>
        <Badge badgeContent={notifications.length} color='error'>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={open}
        onClose={handleClose}
        sx={{
          padding: '10px',
          borderRadius: '8px',
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            flexDirection: 'column',
          }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}>
            <Typography variant='h6' sx={{ p: 1 }}>
              Your Notifications
            </Typography>
          </Box>

          <Divider sx={{ mb: 1 }} />
        </Box>

        {notifications.map((notification, index) => (
          <MenuItem key={index} onClick={handleClose}>
            {notification.message}
          </MenuItem>
        ))}
        {notifications.length === 0 ? (
          <MenuItem onClick={handleClose}>No new notifications...</MenuItem>
        ) : (
          <MenuItem onClick={handleClear}>
            <Link underline='hover' sx={{ fontSize: '14px', textAlign: 'center', width: '100%' }}>
              Clear
            </Link>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default Notifications;
