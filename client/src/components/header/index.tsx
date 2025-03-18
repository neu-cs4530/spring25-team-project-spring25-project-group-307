import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import MenuLeft from './menuLeft';
import useHeader from '../../hooks/useHeader';
import './index.css';
import SearchBar from './searchBar';
import MenuRight from './menuRight';

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
  const {
    val,
    anchorEl,
    notificationAnchorEl,
    handleInputChange,
    handleKeyDown,
    handleSignOut,
    handleMenu,
    handleNotificationMenu,
    handleClose,
    handleViewProfile,
    handleNavigateHome,
  } = useHeader();

  const notifications = [
    'You have a new message',
    'Your answer was upvoted',
    'New comment on your question',
    'Community event happening tomorrow',
  ];

  return (
    <AppBar position='fixed' color='primary'>
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <MenuLeft handleDrawerToggle={handleDrawerToggle} handleNavigateHome={handleNavigateHome} />
        <SearchBar handleInputChange={handleInputChange} handleKeyDown={handleKeyDown} val={val} />
        <MenuRight
          notifications={notifications}
          notificationAnchorEl={notificationAnchorEl}
          handleNotificationMenu={handleNotificationMenu}
          handleClose={handleClose}
          anchorEl={anchorEl}
          handleMenu={handleMenu}
          handleViewProfile={handleViewProfile}
          handleSignOut={handleSignOut}
        />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
