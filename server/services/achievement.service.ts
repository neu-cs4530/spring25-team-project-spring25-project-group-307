import UserModel from '../models/users.model';

// grants an achievement to the given user.
const grantAchievementToUser = async (
  userId: string,
  achievementName: string,
): Promise<string | null> => {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error('User not found.');

  if (user.achievements && !user.achievements.includes(achievementName)) {
    user.achievements.push(achievementName);
    await user.save();
    return achievementName;
  }

  return null;
};

export default grantAchievementToUser;
