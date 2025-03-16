import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useState } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import TopicIcon from '@mui/icons-material/Topic';
import PublicIcon from '@mui/icons-material/Public';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import PeopleIcon from '@mui/icons-material/People';
import CasinoIcon from '@mui/icons-material/Casino';
import { Toolbar } from '@mui/material';
import { NavLink } from 'react-router-dom';
import Header from '../../header';

/**
 * The width of the drawer.
 */
const DRAWERWIDTH = 240;

/**
 * The SideBarNav component has four menu items: "Questions", "Tags", "Messaging", and "Users".
 * It highlights the currently selected item based on the active page and
 * triggers corresponding functions when the menu items are clicked.
 */
const SideBarNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const links1 = [
    { id: 'menu_questions', title: 'Questions', path: '/home', icon: <QuestionMarkIcon /> },
    {
      id: 'menu_communities',
      title: 'Communities',
      path: '/communities',
      icon: <LocalLibraryIcon />,
    },
    { id: 'menu_tag', title: 'Tags', path: '/tags', icon: <TopicIcon /> },
  ];

  const links2 = [
    {
      id: 'menu_global_messaging',
      title: 'Global Message',
      path: '/messaging',
      icon: <PublicIcon />,
    },
    {
      id: 'menu_direct_messaging',
      title: 'Direct Message',
      path: '/messaging/direct-message',
      icon: <ForwardToInboxIcon />,
    },
  ];

  const links3 = [
    { id: 'menu_users', title: 'Users', path: '/users', icon: <PeopleIcon /> },
    { id: 'menu_games', title: 'Games', path: '/games', icon: <CasinoIcon /> },
    { id: 'menu_leaderboard', title: 'Leaderboard', path: '/leaderboard', icon: <PeopleIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header handleDrawerToggle={handleDrawerToggle} />
      <Box component='nav' aria-label='mailbox folders'>
        <Drawer
          variant='temporary'
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          sx={{
            'display': { xs: 'block', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWERWIDTH },
          }}
          slotProps={{
            root: {
              keepMounted: true, // Better open performance on mobile.
            },
          }}>
          <div>
            <Toolbar />
            <Divider />
            <List>
              {links1.map(link => (
                <ListItem key={link.id} disablePadding>
                  <ListItemButton
                    component={NavLink}
                    to={link.path}
                    selected={link.path === window.location.pathname}
                    onClick={handleDrawerClose}>
                    <ListItemIcon>{link.icon}</ListItemIcon>
                    <ListItemText primary={link.title} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider />
            <List>
              {links2.map(link => (
                <ListItem key={link.id} disablePadding>
                  <ListItemButton
                    component={NavLink}
                    to={link.path}
                    selected={link.path === window.location.pathname}
                    onClick={handleDrawerClose}>
                    <ListItemIcon>{link.icon}</ListItemIcon>
                    <ListItemText primary={link.title} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider />
            <List>
              {links3.map(link => (
                <ListItem key={link.id} disablePadding>
                  <ListItemButton
                    component={NavLink}
                    to={link.path}
                    selected={link.path === window.location.pathname}
                    onClick={handleDrawerClose}>
                    <ListItemIcon>{link.icon}</ListItemIcon>
                    <ListItemText primary={link.title} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </div>
        </Drawer>
      </Box>
    </Box>
  );
};

export default SideBarNav;
