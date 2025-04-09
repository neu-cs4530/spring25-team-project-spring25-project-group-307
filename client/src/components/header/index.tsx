import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import MenuLeft from './menuLeft';
import useHeader from '../../hooks/useHeader';
import './index.css';
import SearchBar from './searchBar';
import MenuRight from './menuRight';
import useUserContext from '../../hooks/useUserContext';

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
    handleInputChange,
    handleKeyDown,
    handleSignOut,
    handleMenu,
    handleClose,
    handleViewProfile,
    handleNavigateHome,
  } = useHeader();

  const navigate = useNavigate();

  const { user: currentUser } = useUserContext();

  const handleViewStatistics = () => {
    navigate(`/statistics/${currentUser.username}`);
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
        <MenuLeft handleDrawerToggle={handleDrawerToggle} handleNavigateHome={handleNavigateHome} />
        <SearchBar handleInputChange={handleInputChange} handleKeyDown={handleKeyDown} val={val} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MenuRight
            handleClose={handleClose}
            anchorEl={anchorEl}
            handleMenu={handleMenu}
            handleViewProfile={handleViewProfile}
            handleSignOut={handleSignOut}
            handleViewStatistics={handleViewStatistics}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
