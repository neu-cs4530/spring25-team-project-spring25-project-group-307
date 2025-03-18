import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuItem from '@mui/material/MenuItem';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import { useNavigate } from 'react-router-dom';
import { TextField } from '@mui/material';
import useHeader from '../../hooks/useHeader';
import useUserContext from '../../hooks/useUserContext';
import './index.css';

/**
 * Interface representing the props for the Header component.
 *
 * handleDrawerToggle - The function to handle the opening and closing of the drawer.
 */
interface HeaderProps {
  handleDrawerToggle: () => void;
}

/**
 * Header component that renders the main title and a search bar.
 * The search bar allows the user to input a query and navigate to the search results page
 * when they press Enter.
 */
const Header = ({ handleDrawerToggle }: HeaderProps) => {
  const { val, handleInputChange, handleKeyDown, handleSignOut } = useHeader();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewProfile = () => {
    navigate(`/user/${currentUser.username}`);
    handleClose();
  };

  return (
    <AppBar position='fixed' color='primary'>
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            size='large'
            edge='start'
            color='inherit'
            aria-label='menu'
            sx={{ mr: 2 }}
            onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Typography
            variant='h6'
            component='div'
            sx={{ flexGrow: 1 }}
            onClick={() => navigate('/home')}>
            Fake Stack Overflow
          </Typography>
        </Box>
        <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <TextField
            id='search'
            label='Search...'
            variant='outlined'
            value={val}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            size='small'
            sx={{ width: '300px', background: 'white', borderRadius: '5px' }}
          />
        </Box>
        <Box>
          <IconButton size='large' aria-label='notifications' color='inherit'>
            <Badge badgeContent={4} color='error'>
              <NotificationsIcon />
            </Badge>
          </IconButton>
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
              vertical: 'top',
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
      </Toolbar>
    </AppBar>
  );
};

export default Header;
