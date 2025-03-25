import './index.css';
import { Outlet } from 'react-router-dom';
import { Snackbar } from '@mui/material';

import SideBarNav from '../main/sideBarNav';
import useUserPreferenceUpdates from '../../hooks/useUserPreferenceUpdates';

/**
 * Main component represents the layout of the main page, including a sidebar and the main content area.
 */
const Layout = () => {
  const { snackbarOpen, setSnackbarOpen } = useUserPreferenceUpdates();

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={6000}
        message='New post added!'
      />
      <div id='main' className='main'>
        <SideBarNav />
        <div id='right_main' className='right_main'>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
