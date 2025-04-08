import { Socket } from 'socket.io';
import UserNotificationManager from '../../services/userNotificationManager';
import { getAllPreferencesForCommunity } from '../../services/preferences.service';
import { addNotification } from '../../services/userNotifications.service';

// Mock external services
jest.mock('../../services/preferences.service');
jest.mock('../../services/userNotifications.service');

describe('UserNotificationManager', () => {
  const manager: UserNotificationManager = UserNotificationManager.getInstance();
  let mockSocket: Partial<Socket>;

  beforeEach(() => {
    // Reset the singleton manager state before every test
    manager.reset();

    // Mock socket with id and emit function
    mockSocket = {
      id: 'socket1',
      emit: jest.fn(),
    };
  });

  describe('addInitialConnection', () => {
    it('should store socket in manager with null user initially', () => {
      manager.addInitialConnection(mockSocket as Socket);

      expect(manager['_socketIdToUser'].get('socket1')).toBe(null);
      expect(manager['_socketIdToSocket'].get('socket1')).toBe(mockSocket);
    });
  });

  describe('updateConnectionUserLogin', () => {
    it('should update the username associated with a socket', () => {
      manager.addInitialConnection(mockSocket as Socket);

      manager.updateConnectionUserLogin('user1', 'socket1');

      expect(manager['_socketIdToUser'].get('socket1')).toBe('user1');
    });
  });

  describe('removeConnection', () => {
    it('should remove socket and associated user from the manager', () => {
      manager.addInitialConnection(mockSocket as Socket);

      manager.removeConnection('socket1');

      expect(manager['_socketIdToUser'].has('socket1')).toBe(false);
      expect(manager['_socketIdToSocket'].has('socket1')).toBe(false);
    });
  });

  describe('getLoggedInUsers', () => {
    it('should return a list of logged-in users only', () => {
      manager.addInitialConnection(mockSocket as Socket);
      manager.updateConnectionUserLogin('user1', 'socket1');

      // Add another socket without a user
      manager.addInitialConnection({ id: 'socket2' } as Socket);

      expect(manager.getLoggedInUsers()).toEqual(['user1']);
    });
  });

  describe('getUserSocketByUsername', () => {
    it('should return socket associated with a specific username', () => {
      manager.addInitialConnection(mockSocket as Socket);
      manager.updateConnectionUserLogin('user1', 'socket1');

      expect(manager.getUserSocketByUsername('user1')).toBe(mockSocket);
    });

    it('should return null if no socket found for username', () => {
      expect(manager.getUserSocketByUsername('nonexistent')).toBeNull();
    });
  });

  describe('notifyOnlineUsersInCommunity', () => {
    it('should notify eligible online users in a community based on preferences', async () => {
      // Mock user preferences
      const preferencesMock = [
        { username: 'user1', userPreferences: ['All Questions'] },
        { username: 'user2', userPreferences: [] }, // No relevant preference
      ];

      (getAllPreferencesForCommunity as jest.Mock).mockResolvedValue(preferencesMock);
      (addNotification as jest.Mock).mockResolvedValue(undefined);

      const socketUser1 = { id: 'socket1', emit: jest.fn() } as any;
      const socketUser2 = { id: 'socket2', emit: jest.fn() } as any;

      manager.addInitialConnection(socketUser1);
      manager.addInitialConnection(socketUser2);
      manager.updateConnectionUserLogin('user1', 'socket1');
      manager.updateConnectionUserLogin('user2', 'socket2');

      await manager.notifyOnlineUsersInCommunity(
        'testCommunity',
        'All Questions',
        'New question posted!',
        ['user2'], // Blocklist user2
        'question123',
      );

      // Only user1 should get notified
      expect(addNotification).toHaveBeenCalledWith('user1', {
        message: 'New question posted!',
        questionId: 'question123',
      });

      expect(socketUser1.emit).toHaveBeenCalledWith('preferencesUpdate', 'New question posted!');
      expect(socketUser2.emit).not.toHaveBeenCalled();
    });
  });

  describe('notifySpecificOnlineUsers', () => {
    it('should notify only specified users who have the correct preference', async () => {
      const preferencesMock = [
        { username: 'user1', userPreferences: ['All Questions'] },
        { username: 'user2', userPreferences: [''] }, // No relevant preference
      ];

      (getAllPreferencesForCommunity as jest.Mock).mockResolvedValue(preferencesMock);
      (addNotification as jest.Mock).mockResolvedValue(undefined);

      const socketUser1 = { id: 'socket1', emit: jest.fn() } as any;
      const socketUser2 = { id: 'socket2', emit: jest.fn() } as any;

      manager.addInitialConnection(socketUser1);
      manager.addInitialConnection(socketUser2);
      manager.updateConnectionUserLogin('user1', 'socket1');
      manager.updateConnectionUserLogin('user2', 'socket2');

      await manager.notifySpecificOnlineUsers(
        'testCommunity',
        ['user1'], // Only notify user1
        'All Questions',
        'Special announcement!',
        'question456',
      );

      // Only user1 should receive notification
      expect(addNotification).toHaveBeenCalledWith('user1', {
        message: 'Special announcement!',
        questionId: 'question456',
      });

      expect(socketUser1.emit).toHaveBeenCalledWith('preferencesUpdate', 'Special announcement!');
      expect(socketUser2.emit).not.toHaveBeenCalled();
    });
  });
});
