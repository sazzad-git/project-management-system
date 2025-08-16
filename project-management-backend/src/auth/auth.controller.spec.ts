import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // signup এন্ডপয়েন্টের জন্য টেস্ট
  describe('signup', () => {
    it('should call authService.signup with the correct data', async () => {
      const createUserDto = {
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
        role: 'developer',
      };
      const expectedResult = {
        id: '1',
        name: 'Test',
        email: 'test@example.com',
        role: 'developer',
      };

      // Arrange
      mockAuthService.signup.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signup(createUserDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.signup).toHaveBeenCalledWith(createUserDto);
    });
  });

  // login এন্ডপয়েন্টের জন্য টেস্ট
  describe('login', () => {
    it('should call authService.login and return an access token', async () => {
      const user = { id: '1', email: 'test@example.com', role: 'developer' };
      const req = { user }; // Guard থেকে আসা রিকোয়েস্ট অবজেক্টের মক
      const expectedResult = { access_token: 'mockAccessToken' };

      // Arrange
      mockAuthService.login.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.login(req);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
    });
  });
});
