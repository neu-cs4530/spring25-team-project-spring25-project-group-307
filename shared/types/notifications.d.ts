export interface Notification {
  message: string;
  questionId: string;
}

export interface UserNotifications {
  username: string;
  notifications: Notification[];
}

export interface DatabaseUserNotifications extends UserNotifications {
  _id: ObjectId;
}
