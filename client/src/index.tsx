import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import { AchievementProvider } from './contexts/AchievementContext';
import FakeStackOverflow from './components/fakestackoverflow';
import { FakeSOSocket } from './types/types';

const container = document.getElementById('root');

const theme = createTheme({
  // colorSchemes: {
  //   dark: true,
  // },
  palette: {
    primary: {
      main: '#8E735B',
    },
    secondary: {
      main: '#D1B397',
    },
  },
});

const App = () => {
  const [socket, setSocket] = useState<FakeSOSocket | null>(null);

  const serverURL = process.env.REACT_APP_SERVER_URL;

  if (serverURL === undefined) {
    throw new Error("Environment variable 'REACT_APP_SERVER_URL' must be defined");
  }

  useEffect(() => {
    if (!socket) {
      setSocket(io(serverURL));
    }

    return () => {
      if (socket !== null) {
        socket.disconnect();
      }
    };
  }, [socket, serverURL]);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AchievementProvider>
          <FakeStackOverflow socket={socket} />
        </AchievementProvider>
      </Router>
    </ThemeProvider>
  );
};

if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
}
