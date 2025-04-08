import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useUserContext from './useUserContext';
import { GameErrorPayload, GameInstance, GameState, GameUpdatePayload } from '../types/types';
import { joinGame, leaveGame } from '../services/gamesService';
import { useAchievement } from '../contexts/AchievementContext';

/**
 * Custom hook to manage the state and logic for the game page, including joining, leaving the game, and handling game updates.
 * @returns An object containing the following:
 * - `gameInstance`: The current game instance, or null if no game is joined.
 * - `error`: A string containing any error messages related to the game, or null if no errors exist.
 * - `handleLeaveGame`: A function to leave the current game and navigate back to the game list.
 */
const useGamePage = () => {
  const { user, socket } = useUserContext();
  const { gameID } = useParams();
  const navigate = useNavigate();
  const { triggerAchievement } = useAchievement();
  const [gameInstance, setGameInstance] = useState<GameInstance<GameState> | null>(null);
  const [joinedGameID, setJoinedGameID] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleLeaveGame = async () => {
    if (joinedGameID && gameInstance?.state.status !== 'OVER') {
      await leaveGame(joinedGameID, user.username);
      setGameInstance(null);
      setJoinedGameID('');
    }

    socket.emit('leaveGame', joinedGameID);
    navigate('/games');
  };

  useEffect(() => {
    const handleJoinGame = async (id: string) => {
      try {
        const joinedGame = await joinGame(id, user.username);

        if (!joinedGame || joinedGame.state.status === 'OVER') {
          setError('This game has already ended.');
          navigate('/games');
          return;
        }

        setGameInstance(joinedGame);
        setJoinedGameID(joinedGame.gameID);
        socket.emit('joinGame', joinedGame.gameID);
      } catch (err) {
        // catch error
      }
    };

    if (gameID) {
      handleJoinGame(gameID);
    }

    const handleGameUpdate = (updatedState: GameUpdatePayload) => {
      setGameInstance(prevGameInstance =>
        prevGameInstance ? updatedState.gameInstance : prevGameInstance,
      );
      setError(null);
    };

    const handleGameError = (gameError: GameErrorPayload) => {
      if (gameError.player === user.username) {
        setError(gameError.error);
      }
    };

    const handleGameAchievement = (payload: { unlockedAchievements: string[] }) => {
      payload.unlockedAchievements.forEach(triggerAchievement);
    };

    socket.on('gameAchievement', handleGameAchievement);

    socket.on('gameUpdate', handleGameUpdate);
    socket.on('gameError', handleGameError);

    return () => {
      socket.off('gameUpdate', handleGameUpdate);
      socket.off('gameError', handleGameError);
    };
  }, [gameID, navigate, socket, triggerAchievement, user.username]);
  return {
    gameInstance,
    error,
    handleLeaveGame,
  };
};

export default useGamePage;
