import React from 'react';
import './index.css';
import { Outlet } from 'react-router-dom';
import SideBarNav from '../main/sideBarNav';
import { RankUpProvider } from '../notificaitonSettings/index';

/**
 * Main component represents the layout of the main page, including a sidebar and the main content area.
 */
const Layout = () => (
  <RankUpProvider>
    <div id='main' className='main'>
      <SideBarNav />
      <div id='right_main' className='right_main'>
        <Outlet />
      </div>
    </div>
  </RankUpProvider>
);

export default Layout;
