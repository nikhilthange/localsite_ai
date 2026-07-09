import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthRepository } from '../repositories/AuthRepository';
import { User } from '../models/User';
import { config } from '../../../config';
import { EventBus } from '../../../core/events/EventBus';
import { SystemEvents } from '../../../types/events';
import { TokenPair } from '../../../types/services';
import { AuthPayload } from '../../../types/express';
import { ConflictError, UnauthorizedError, NotFoundError, AppError } from '../../../utils/AppError';
import { generateRandomToken } from '../../../utils/helpers';

const authRepository = new AuthRepository();

export class AuthService {
  static async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ user: any; tokens: TokenPair }> {
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const user = await User.create({ name, email, password });

    const tokens = this.generateTokenPair(
      user._id.toString(),
      user.role,
      user.email
    );

    await authRepository.addRefreshToken(user._id.toString(), tokens.refreshToken);

    EventBus.emit(SystemEvents.USER_REGISTERED, {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      timestamp: new Date(),
    });

    const userObj = user.toObject() as any;
    delete userObj.password;

    return { user: userObj, tokens };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ user: any; tokens: TokenPair }> {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const skipVerification = process.env.SKIP_EMAIL_VERIFICATION === 'true' && config.isDevelopment;
    if (!user.emailVerified && !skipVerification) {
      throw new UnauthorizedError('Please verify your email before logging in');
    }

    const tokens = this.generateTokenPair(
      user._id.toString(),
      user.role,
      user.email
    );

    await authRepository.addRefreshToken(user._id.toString(), tokens.refreshToken);
    await authRepository.update(user._id.toString(), { lastLogin: new Date() } as any);

    EventBus.emit(SystemEvents.USER_LOGGED_IN, {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      timestamp: new Date(),
    });

    const userObj = user.toObject() as any;
    delete userObj.password;

    return { user: userObj, tokens };
  }

  static async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret, { algorithms: ['HS256'] }) as { userId: string };
    const user = await authRepository.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const tokenExists = user.refreshTokens.includes(refreshToken);
    if (!tokenExists) {
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    const newPair = this.generateTokenPair(
      user._id.toString(),
      user.role,
      user.email
    );

    await authRepository.removeRefreshToken(decoded.userId, refreshToken);
    await authRepository.addRefreshToken(decoded.userId, newPair.refreshToken);

    return newPair;
  }

  static async logout(userId: string, refreshToken: string): Promise<void> {
    await authRepository.removeRefreshToken(userId, refreshToken);
  }

  static async forgotPassword(email: string): Promise<void> {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await authRepository.update(user._id.toString(), {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000),
    } as any);
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const salt = await bcrypt.genSalt(config.auth.bcryptRounds);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = [];
    await user.save();
  }

  static async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      throw new AppError('Invalid verification token', 400);
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      throw new AppError('Verification token has expired', 400);
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
  }

  static verifyAccessToken(token: string): AuthPayload {
    const decoded = jwt.verify(token, config.jwt.accessSecret, { algorithms: ['HS256'] }) as AuthPayload;
    return decoded;
  }

  static generateTokenPair(userId: string, role: string, email: string): TokenPair {
    const sessionId = crypto.randomBytes(16).toString('hex');

    const accessToken = jwt.sign(
      { userId, role, email, sessionId },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId, sessionId },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }
}
