import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../../auth/models/User';
import { IUser } from '../../../types/models';
import { PaginationParams, PaginatedResult } from '../../../types/services';
import { NotFoundError, AppError } from '../../../utils/AppError';
import { config } from '../../../config';

const userRepository = new UserRepository();

export class UserService {
  static async getProfile(userId: string): Promise<IUser | null> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }

  static async updateProfile(userId: string, data: Partial<IUser>): Promise<IUser | null> {
    const user = await userRepository.updateProfile(userId, data);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }

  static async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new NotFoundError('User');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    const salt = await bcrypt.genSalt(config.auth.bcryptRounds);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();
  }

  static async getPreferences(userId: string): Promise<IUser['preferences']> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user.preferences;
  }

  static async updatePreferences(
    userId: string,
    preferences: Partial<IUser['preferences']>
  ): Promise<IUser['preferences']> {
    const user = await userRepository.updatePreferences(userId, preferences);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user.preferences;
  }

  static async getUsers(params?: PaginationParams): Promise<PaginatedResult<IUser>> {
    return userRepository.getAllUsers({}, params);
  }

  static async getUserAnalytics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newThisMonth: number;
    byRole: Record<string, number>;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, activeUsers, newThisMonth, roleAggregation] = await Promise.all([
      userRepository.count({}),
      userRepository.count({ isActive: true }),
      userRepository.count({ createdAt: { $gte: startOfMonth } }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
    ]);

    const byRole: Record<string, number> = {};
    for (const item of roleAggregation) {
      byRole[item._id] = item.count;
    }

    return { totalUsers, activeUsers, newThisMonth, byRole };
  }
}
