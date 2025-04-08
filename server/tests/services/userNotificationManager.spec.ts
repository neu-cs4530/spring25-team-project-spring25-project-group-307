import { Socket } from 'socket.io';
import UserNotificationManager from '../../services/userNotificationManager';
import { getAllPreferencesForCommunity } from '../../services/preferences.service';
import { addNotification } from '../../services/userNotifications.service';

jest.mock('../../services/preferences.service');
jest.mock('../../services/userNotifications.service');

describe('UserNotificationManager', () => {
  const manager: UserNotificationManager = UserNotificationManager.getInstance();
  let mockSocket: Partial<Socket>;

  beforeEach(() => {
    manager.reset(); // Reset the instance before each test

    mockSocket = {
      id: 'socket1',
      emit: jest.fn(),
    };
  });

  describe('addInitialConnection', () => {
    it('should add a socket with null user', () => {
      manager.addInitialConnection(mockSocket as Socket);
      expect(manager['\_socketIdToUser'].get('socket1')).toBe(null);
      expect(manager['\_socketIdToSocket'].get('socket1')).toBe(mockSocket);
    });
  });

  describe('updateConnectionUserLogin', () => {
    it('should update the username for a socket', () => {
      manager.addInitialConnection(mockSocket as Socket);
      manager.updateConnectionUserLogin('user1', 'socket1');
      expect(manager['\_socketIdToUser'].get('socket1')).toBe('user1');
    });
  });

  describe('removeConnection', () => {
    it('should remove a socket and user', () => {
      manager.addInitialConnection(mockSocket as Socket);
      manager.removeConnection('socket1');
      expect(manager['\_socketIdToUser'].has('socket1')).toBe(false);
      expect(manager['\_socketIdToSocket'].has('socket1')).toBe(false);
    });
  });

  describe('getLoggedInUsers', () => {
    it('should return only logged in users', () => {
      manager.addInitialConnection(mockSocket as Socket);
      manager.updateConnectionUserLogin('user1', 'socket1');
      manager.addInitialConnection({ id: 'socket2' } as Socket);

      expect(manager.getLoggedInUsers()).toEqual(['user1']);
    });
  });

  describe('getUserSocketByUsername', () => {
    it('should return the correct socket', () => {
      manager.addInitialConnection(mockSocket as Socket);
      manager.updateConnectionUserLogin('user1', 'socket1');

      expect(manager.getUserSocketByUsername('user1')).toBe(mockSocket);
    });

    it('should return null if user not found', () => {
      expect(manager.getUserSocketByUsername('nonexistent')).toBeNull();
    });
  });

  describe('notifyOnlineUsersInCommunity', () => {
    it('should notify eligible users and skip ineligible ones', async () => {
      const preferencesMock = [
        {
          username: 'user1',
          userPreferences: ['All Questions'],
        },
        {
          username: 'user2',
          userPreferences: [],
        },
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
        ['user2'],
        'question123',
      );

      expect(addNotification).toHaveBeenCalledWith('user1', {
        message: 'New question posted!',
        questionId: 'question123',
      });

      expect(socketUser1.emit).toHaveBeenCalledWith('preferencesUpdate', 'New question posted!');
      expect(socketUser2.emit).not.toHaveBeenCalled();
    });
  });

  describe('notifySpecificOnlineUsers', () => {
    it('should notify only specific users with correct preference', async () => {
      const preferencesMock = [
        {
          username: 'user1',
          userPreferences: ['All Questions'],
        },
        {
          username: 'user2',
          userPreferences: [''],
        },
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
        ['user1'],
        'All Questions',
        'Special announcement!',
        'question456',
      );

      expect(addNotification).toHaveBeenCalledWith('user1', {
        message: 'Special announcement!',
        questionId: 'question456',
      });

      expect(socketUser1.emit).toHaveBeenCalledWith('preferencesUpdate', 'Special announcement!');
      expect(socketUser2.emit).not.toHaveBeenCalled();
    });
  });
});
