import { BaseRepository } from '../../../core/database/BaseRepository';
import { User } from '../../auth/models/User';
import { IUser } from '../../../types/models';
import { PaginationParams, PaginatedResult } from '../../../types/services';
import { FilterQuery } from 'mongoose';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email: email.toLowerCase() });
  }

  async updateProfile(userId: string, data: Record<string, any>): Promise<IUser | null> {
    const allowed = ['name', 'email', 'avatar'];
    const update: Record<string, any> = {};
    for (const field of allowed) {
      if (data[field] !== undefined) {
        update[field] = data[field];
      }
    }
    return this.update(userId, update as any);
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<IUser | null> {
    return this.update(userId, { password: hashedPassword } as any);
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<IUser['preferences']>
  ): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).lean() as unknown as Promise<IUser | null>;
  }

  async getAllUsers(filter: FilterQuery<IUser> = {}, params?: PaginationParams): Promise<PaginatedResult<IUser>> {
    return this.paginate(filter, params);
  }
}
