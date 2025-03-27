import { ClientToServerEvents, ServerToClientEvents } from '@fake-stack-overflow/shared';
import { DefaultEventsMap, Socket } from 'socket.io';

class UserNotificationManager {
  /**
   * Maps socket IDs to usernames (or null if not logged in).
   */
  private _socketIdToUser: Map<string, string | null>;

  /**
   * Maps socket IDs to their corresponding Socket instances.
   */
  private _socketIdToSocket: Map<
    string,
    Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, any>
  >;

  /**
   * Singleton instance of UserNotificationManager.
   */
  private static _instance: UserNotificationManager | undefined;

  /**
   * Private constructor to enforce singleton pattern.
   */
  private constructor() {
    this._socketIdToUser = new Map();
    this._socketIdToSocket = new Map();
  }

  /**
   * Returns the singleton instance of UserNotificationManager.
   * @returns {UserNotificationManager} The single instance of the manager.
   */
  public static getInstance(): UserNotificationManager {
    if (!UserNotificationManager._instance) {
      UserNotificationManager._instance = new UserNotificationManager();
    }
    return UserNotificationManager._instance;
  }

  /**
   * Registers a new socket connection. Initially, the user is not logged in.
   * @param {Socket} socket - The WebSocket connection instance.
   */
  public addInitialConnection(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, any>,
  ): void {
    this._socketIdToUser.set(socket.id, null);
    this._socketIdToSocket.set(socket.id, socket);
  }

  /**
   * Associates a username with an existing socket connection.
   * @param {string} username - The username of the logged-in user.
   * @param {string} socketId - The unique ID of the socket connection.
   */
  public updateConnectionUserLogin(username: string, socketId: string): void {
    this._socketIdToUser.set(socketId, username);
  }

  /**
   * Removes a socket connection and its associated user, if any.
   * @param {string} socketId - The unique ID of the socket connection to remove.
   */
  public removeConnection(socketId: string): void {
    console.log(`Removing connection for ${this._socketIdToUser.get(socketId)}`);
    this._socketIdToUser.delete(socketId);
    this._socketIdToSocket.delete(socketId);
  }

  /**
   * Retrieves a list of currently logged-in users.
   * @returns {string[]} An array of usernames that are currently logged in.
   */
  public getLoggedInUsers(): string[] {
    return Array.from(this._socketIdToUser.values()).filter(
      (username): username is string => username !== null,
    );
  }

  /**
   * Retrieves the WebSocket connection for a given username.
   * @param {string} username - The username of the user whose socket is needed.
   * @returns {Socket | null} The user's socket instance, or null if not online.
   */
  public getUserSocketByUsername(
    username: string,
  ): Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, any> | null {
    for (const [socketId, user] of this._socketIdToUser.entries()) {
      if (user === username) {
        return this._socketIdToSocket.get(socketId) || null;
      }
    }
    return null;
  }
}

export default UserNotificationManager;
