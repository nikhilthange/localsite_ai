import { BaseRepository } from '../../../core/database/BaseRepository';
import { User } from '../models/User';
import { IUser } from '../../../types/models';

export class AuthRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email: email.toLowerCase() });
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return this.findOne({ googleId });
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<IUser | null> {
    return this.update(userId, { refreshTokens: [refreshToken] } as any);
  }

  async addRefreshToken(userId: string, token: string): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { $push: { refreshTokens: token } },
      { new: true, runValidators: true }
    ).lean() as unknown as Promise<IUser | null>;
  }

  async removeRefreshToken(userId: string, token: string): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { $pull: { refreshTokens: token } },
      { new: true, runValidators: true }
    ).lean() as unknown as Promise<IUser | null>;
  }

  async clearRefreshTokens(userId: string): Promise<IUser | null> {
    return this.update(userId, { refreshTokens: [] } as any);
  }

  async findByIdWithSubscription(userId: string): Promise<IUser | null> {
    return this.model.findById(userId).populate('subscriptionId').lean() as unknown as Promise<IUser | null>;
  }
}
