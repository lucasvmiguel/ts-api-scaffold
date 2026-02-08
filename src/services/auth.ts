import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { UserRepository } from "../repositories/user";
import { TokenRepository } from "../repositories/token";
import type { User } from "../generated/prisma/client";
import type { Token, DecodedToken } from "../types/token";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

type UserWithoutPassword = Omit<User, "password">;

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository,
  ) {}

  /**
   * Register a new user by creating a new user in the database and generating tokens for the user.
   */
  async register(data: {
    email: string;
    password: string;
    name?: string;
  }): Promise<{ user: UserWithoutPassword; token: Token }> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AuthError("User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
    const token = await this.generateTokens(user);

    return {
      user: { ...user, password: undefined } as UserWithoutPassword,
      token,
    };
  }

  /**
   * Login a user by finding the user in the database and comparing the password.
   * If the password is correct, generate tokens for the user.
   */
  async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: UserWithoutPassword; token: Token }> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new AuthError("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new AuthError("Invalid credentials");
    }

    const tokens = await this.generateTokens(user);
    return {
      user: { ...user, password: undefined } as UserWithoutPassword,
      token: tokens,
    };
  }

  /**
   * Refresh tokens by finding the token in the database and checking if it is valid.
   * If the token is valid, generate new tokens for the user.
   */
  async refresh(refreshToken: string): Promise<Token> {
    const storedToken = await this.tokenRepository.findByToken(refreshToken);
    if (!storedToken || storedToken.revoked) {
      throw new AuthError("Invalid refresh token");
    }

    // Check if expired
    if (storedToken.expiresAt < new Date()) {
      await this.tokenRepository.revoke(storedToken.id);
      throw new AuthError("Refresh token expired");
    }

    // Revoke old token (Rotation)
    await this.tokenRepository.revoke(storedToken.id);

    const user = await this.userRepository.findById(storedToken.userId);
    if (!user) {
      throw new Error("User not found");
    }

    return this.generateTokens(user);
  }

  /**
   * Logout a user by revoking the refresh token.
   */
  async logout(refreshToken: string): Promise<void> {
    const storedToken = await this.tokenRepository.findByToken(refreshToken);
    if (storedToken) {
      await this.tokenRepository.revoke(storedToken.id);
    }
  }

  private async generateTokens(user: User): Promise<Token> {
    const decodedToken: DecodedToken = {
      userId: user.id,
      email: user.email,
    };
    const accessToken = jwt.sign(decodedToken, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const refreshToken = crypto.randomBytes(40).toString("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    await this.tokenRepository.create({
      token: refreshToken,
      user: { connect: { id: user.id } },
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
