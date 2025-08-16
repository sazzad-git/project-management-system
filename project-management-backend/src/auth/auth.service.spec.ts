import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';

// bcrypt.hash-কে মক করা, কারণ এটি একটি ধীরগতির অপারেশন
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
  };
  // MailerService-এর জন্য মক যোগ করুন
  const mockMailerService = {
    sendMail: jest.fn(),
  };
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockAccessToken'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailerService, useValue: mockMailerService }, // <-- এই লাইনটি যোগ করুন
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  // প্রতিটি টেস্টের আগে মক ফাংশনগুলো রিসেট করুন
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // signup মেথডের জন্য টেস্ট
  describe('signup', () => {
    it('should create a new user and return user data without password', async () => {
      const createUserDto = {
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
        role: 'developer',
      };
      const createdUser = {
        ...createUserDto,
        id: 'some-uuid',
        password: 'hashedPassword',
      };

      // Arrange: findOneByEmail-কে null রিটার্ন করতে বলুন (ইউজার নেই)
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      // Arrange: create মেথডকে নতুন ইউজার রিটার্ন করতে বলুন
      mockUsersService.create.mockResolvedValue(createdUser);

      // Act
      const result = await service.signup(createUserDto);

      // Assert
      expect(result).not.toHaveProperty('password');
      expect(result.email).toEqual(createUserDto.email);
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedPassword',
      });
    });

    it('should throw a ConflictException if email already exists', async () => {
      const createUserDto = {
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
        role: 'developer',
      };

      // Arrange: findOneByEmail-কে একটি বিদ্যমান ইউজার রিটার্ন করতে বলুন
      mockUsersService.findOneByEmail.mockResolvedValue({
        id: 'some-id',
        email: 'test@example.com',
      });

      // Act & Assert
      await expect(service.signup(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // validateUser মেথডের জন্য টেস্ট
  describe('validateUser', () => {
    it('should return user data without password if credentials are valid', async () => {
      const user: User = {
        id: '1',
        name: 'Test',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'developer',
      } as User;

      // Arrange
      mockUsersService.findOneByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // পাসওয়ার্ড ম্যাচ করেছে

      // Act
      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      // Assert
      expect(result).not.toHaveProperty('password');
      expect(result.id).toEqual(user.id);
    });

    it('should return null if password does not match', async () => {
      const user: User = {
        id: '1',
        name: 'Test',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'developer',
      } as User;

      // Arrange
      mockUsersService.findOneByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // পাসওয়ার্ড ম্যাচ করেনি

      // Act & Assert
      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).resolves.toBeNull();
    });

    it('should return null if user is not found', async () => {
      // Arrange
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.validateUser('notfound@example.com', 'password'),
      ).resolves.toBeNull();
    });
  });

  // login মেথডের জন্য টেস্ট
  describe('login', () => {
    it('should return an access token and user profile', async () => {
      const user = {
        id: '1',
        name: 'Test',
        email: 'test@example.com',
        role: 'developer',
        password: 'hashedPassword',
      };
      const userProfile = {
        id: '1',
        name: 'Test',
        email: 'test@example.com',
        role: 'developer',
      };

      const expectedResult = {
        access_token: 'mockAccessToken',
        user: userProfile,
      };

      // Act
      const result = await service.login(user);

      // Assert
      expect(result).toEqual(expectedResult); // <-- এখন এটি user অবজেক্টসহ তুলনা করবে
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        role: user.role,
      });
    });
  });
});
