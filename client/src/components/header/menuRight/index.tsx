import { Badge, Box, IconButton, Menu, MenuItem } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Notifications from './notifications';

/**
 * Interface representing the props for the MenuRight component.
 *
 * notifications - The list of notifications to display.
 * notificationAnchorEl - The anchor element for the notification menu.
 * handleNotificationMenu - The function to handle the opening of the notification menu.
 * handleClose - The function to handle the closing of the menu.
 * anchorEl - The anchor element for the user menu.
 * handleMenu - The function to handle the opening of the user menu.
 * handleViewProfile - The function to handle the navigation to the user's profile.
 * handleSignOut - The function to handle the sign out action.
 */
interface MenuRightProps {
  handleClose: () => void;
  anchorEl: null | HTMLElement;
  handleMenu: (event: React.MouseEvent<HTMLElement>) => void;
  handleViewProfile: () => void;
  handleSignOut: () => void;
}

/**
 * MenuRight component that renders the notification and user menu.
 * The notification menu displays a list of notifications, and the user menu
 * provides options to view the user profile and sign out.
 */
const MenuRight = ({
  handleClose,
  anchorEl,
  handleMenu,
  handleViewProfile,
  handleSignOut,
}: MenuRightProps) => (
  <Box sx={{ display: 'flex' }}>
    <Notifications />

    <IconButton
      size='large'
      aria-label='account of current user'
      aria-controls='menu-appbar'
      aria-haspopup='true'
      onClick={handleMenu}
      color='inherit'>
      <AccountCircle />
    </IconButton>
    <Menu
      id='menu-appbar'
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
      open={Boolean(anchorEl)}
      onClose={handleClose}>
      <MenuItem onClick={handleViewProfile}>View Profile</MenuItem>
      <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
    </Menu>
  </Box>
);

export default MenuRight;
