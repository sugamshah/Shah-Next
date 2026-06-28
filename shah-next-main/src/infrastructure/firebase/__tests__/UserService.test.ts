import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirebaseUserService } from '../UserService';
import { db } from '../config';
import { ref, get } from 'firebase/database';

vi.mock('../config', () => ({
  db: {}
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  get: vi.fn(),
  query: vi.fn(),
  orderByChild: vi.fn(),
  equalTo: vi.fn()
}));

describe('FirebaseUserService', () => {
  let userService: FirebaseUserService;

  beforeEach(() => {
    userService = new FirebaseUserService();
    vi.clearAllMocks();
  });

  it('should get user profile correctly', async () => {
    const mockUser = { uid: '123', name: 'John Doe' };
    (get as any).mockResolvedValue({
      exists: () => true,
      val: () => mockUser
    });

    const result = await userService.getUserProfile('123');
    expect(result).toEqual(mockUser);
    expect(ref).toHaveBeenCalledWith(db, 'users/123');
  });

  it('should return null if user does not exist', async () => {
    (get as any).mockResolvedValue({
      exists: () => false
    });

    const result = await userService.getUserProfile('non-existent');
    expect(result).toBeNull();
  });
});
