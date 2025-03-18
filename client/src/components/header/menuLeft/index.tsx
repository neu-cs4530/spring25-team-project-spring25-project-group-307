import { Box, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

/**
 * Interface representing the props for the Menu component.
 *
 * handleDrawerToggle - The function to handle the opening and closing of the drawer.
 * handleNavigateHome - The function to navigate to the home page.
 */
interface MenuProps {
  handleDrawerToggle: () => void;
  handleNavigateHome: () => void;
}

/**
 * MenuLeft component that renders the main title of the application and a menu icon.
 * The menu icon allows the user to open and close the drawer.
 */
const MenuLeft = ({ handleDrawerToggle, handleNavigateHome }: MenuProps) => (
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
    <Typography variant='h6' component='div' sx={{ flexGrow: 1 }} onClick={handleNavigateHome}>
      Fake Stack Overflow
    </Typography>
  </Box>
);

export default MenuLeft;
