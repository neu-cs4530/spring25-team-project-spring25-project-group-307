import express, { Response } from 'express';
import {
  FakeSOSocket,
  CreateGameRequest,
  GameMovePayload,
  GameRequest,
  NimGameState,
  GetGamesRequest,
} from '../types/types';
import findGames from '../services/game.service';
import UserModel from '../models/users.model';
import grantAchievementToUser from '../services/achievement.service';
import getUpdatedRank from '../utils/userstat.util';
import GameManager from '../services/games/gameManager';
import { GAME_TYPES } from '../types/constants';
import UserNotificationManager from '../services/userNotificationManager';

/**
 * Express controller for handling game-related requests,
 * including creating, joining, leaving games, and fetching games.
 * @param socket The socket instance used for emitting game updates and errors.
 * @returns An Express router with endpoints for game actions.
 */
const gameController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Validates the request for creating a game.
   * @param req The request object containing the game type.
   * @returns A boolean indicating whether the request is valid.
   */
  const isCreateGameRequestValid = (req: CreateGameRequest) =>
    !!req.body && !!req.body.gameType && GAME_TYPES.includes(req.body.gameType);

  /**
   * Validates the request for game actions like joining or leaving the game.
   * @param req The request object containing game ID and player ID.
   * @returns A boolean indicating whether the request is valid.
   */
  const isGameRequestValid = (req: GameRequest) =>
    !!req.body && !!req.body.gameID && !!req.body.playerID;

  /**
   * Creates a new game based on the provided game type and responds with the created game or an error message.
   * @param req The request object containing the game type.
   * @param res The response object to send the result.
   */
  const createGame = async (req: CreateGameRequest, res: Response) => {
    try {
      if (!isCreateGameRequestValid(req)) {
        res.status(400).send('Invalid request');
        return;
      }

      const { gameType } = req.body;

      const newGame = await GameManager.getInstance().addGame(gameType);

      if (typeof newGame !== 'string') {
        throw new Error(newGame.error);
      }

      res.status(200).json(newGame);
    } catch (error) {
      res.status(500).send(`Error when creating game: ${(error as Error).message}`);
    }
  };

  /**
   * Joins a game with the specified game ID and player ID, and emits the updated game state.
   * @param req The request object containing the game ID and player ID.
   * @param res The response object to send the result.
   */
  const joinGame = async (req: GameRequest, res: Response) => {
    try {
      if (!isGameRequestValid(req)) {
        res.status(400).send('Invalid request');
        return;
      }

      const { gameID, playerID } = req.body;

      const game = await GameManager.getInstance().joinGame(gameID, playerID);

      if (!game || typeof game === 'string' || 'error' in game) {
        const errMessage =
          typeof game === 'string' ? game : (game?.error ?? 'Unknown error joining game');
        throw new Error(errMessage);
      }

      socket.to(gameID).emit('gameUpdate', { gameInstance: game });
      res.status(200).json(game);
    } catch (error) {
      res.status(500).send(`Error when joining game: ${(error as Error).message}`);
    }
  };

  /**
   * Leaves the game with the specified game ID and player ID, and emits the updated game state.
   * @param req The request object containing the game ID and player ID.
   * @param res The response object to send the result.
   */
  const leaveGame = async (req: GameRequest, res: Response) => {
    try {
      if (!isGameRequestValid(req)) {
        res.status(400).send('Invalid request');
        return;
      }

      const { gameID, playerID } = req.body;

      const game = await GameManager.getInstance().leaveGame(gameID, playerID);

      if ('error' in game) {
        throw new Error(game.error);
      }

      socket.to(gameID).emit('gameUpdate', { gameInstance: game });
      res.status(200).json(game);
    } catch (error) {
      res.status(500).send(`Error when leaving game: ${(error as Error).message}`);
    }
  };

  /**
   * Fetches games based on optional game type and status query parameters, and responds with the list of games.
   * @param req The request object containing the query parameters for filtering games.
   * @param res The response object to send the result.
   */
  const getGames = async (req: GetGamesRequest, res: Response) => {
    try {
      const { gameType, status } = req.query;

      const games = await findGames(gameType, status);

      res.status(200).json(games);
    } catch (error) {
      res.status(500).send(`Error when getting games: ${(error as Error).message}`);
    }
  };

  /**
   * Handles a game move by applying the move to the game state, emitting updates to all players, and saving the state.
   * @param gameMove The payload containing the game ID and move details.
   * @throws Error if applying the move or saving the game state fails.
   */
  const playMove = async (gameMove: GameMovePayload): Promise<void> => {
    const { gameID, move } = gameMove;

    try {
      const game = GameManager.getInstance().getGame(gameID);

      if (game === undefined) {
        throw new Error('Game requested does not exist');
      }

      game.applyMove(move);
      socket.to(gameID).emit('gameUpdate', { gameInstance: game.toModel() });

      await game.saveGameState();
      const unlocked: string[] = [];
      const { winners } = game.state as NimGameState;
      let winnerUsername = Array.isArray(winners) && winners.length === 1 ? winners[0] : null;

      if (game.state.status === 'OVER') {
        winnerUsername = Array.isArray(winners) && winners.length === 1 ? winners[0] : null;

        if (winnerUsername) {
          const winnerUser = await UserModel.findOne({ username: winnerUsername });
          const currentRank = winnerUser?.ranking;
          if (winnerUser) {
            const totalNimWins = winnerUser.nimGameWins + 1;
            const newScore = winnerUser.score + 7;
            const newRank = getUpdatedRank(newScore);

            if (currentRank !== newRank && newRank === 'Common Contributor') {
              const a = await grantAchievementToUser(winnerUser._id.toString(), 'Ascension I');
              if (a) unlocked.push(a);
            }
            if (currentRank !== newRank && newRank === 'Skilled Solver') {
              const a = await grantAchievementToUser(winnerUser._id.toString(), 'Ascension II');
              if (a) unlocked.push(a);
            }
            if (currentRank !== newRank && newRank === 'Expert Explorer') {
              const a = await grantAchievementToUser(winnerUser._id.toString(), 'Ascension III');
              if (a) unlocked.push(a);
            }
            if (currentRank !== newRank && newRank === 'Mentor Maven') {
              const a = await grantAchievementToUser(winnerUser._id.toString(), 'Ascension IV');
              if (a) unlocked.push(a);
            }
            if (currentRank !== newRank && newRank === 'Master Maverick') {
              const a = await grantAchievementToUser(winnerUser._id.toString(), 'Ascension V');
              if (a) unlocked.push(a);
            }

            if (totalNimWins === 1) {
              const a = await grantAchievementToUser(winnerUser._id.toString(), 'Nim Beginner');
              if (a) unlocked.push(a);
            } else if (totalNimWins === 5) {
              const a = await grantAchievementToUser(winnerUser._id.toString(), 'Nim Novice');
              if (a) unlocked.push(a);
            } else if (totalNimWins === 10) {
              const a = await grantAchievementToUser(winnerUser._id.toString(), 'Nim King');
              if (a) unlocked.push(a);
            }

            await UserModel.updateOne(
              { username: winnerUsername },
              {
                $set: {
                  score: newScore,
                  ranking: newRank,
                  nimGameWins: totalNimWins,
                },
              },
            );
          }
        }
        GameManager.getInstance().removeGame(gameID);
      }
      if (winnerUsername) {
        if (winnerUsername && unlocked.length > 0) {
          const winnerSocket =
            UserNotificationManager.getInstance().getUserSocketByUsername(winnerUsername);
          if (winnerSocket) {
            winnerSocket.emit('gameAchievement', { unlockedAchievements: unlocked });
          }
        }
      }
    } catch (error) {
      socket.to(gameID).emit('gameError', {
        player: move.playerID,
        error: (error as Error).message,
      });
    }
  };

  socket.on('connection', conn => {
    conn.on('joinGame', (gameID: string) => {
      conn.join(gameID);
    });

    conn.on('leaveGame', (gameID: string) => {
      conn.leave(gameID);
    });

    conn.on('makeMove', playMove);
  });

  // Register routes
  router.post('/create', createGame);
  router.post('/join', joinGame);
  router.post('/leave', leaveGame);
  router.get('/games', getGames);

  return router;
};

export default gameController;
