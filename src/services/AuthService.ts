import { Profile } from '../types/database';
import { mockProfile } from './mockData';

export class AuthService {
  static async getCurrentUser(): Promise<Profile> {
    return mockProfile;
  }

  static async signIn(email: string, _password: string): Promise<{ user: Profile; token: string }> {
    return {
      user: { ...mockProfile, email },
      token: 'mock-jwt-token-sample',
    };
  }

  static async signUp(email: string, fullName: string, phone?: string): Promise<{ user: Profile }> {
    return {
      user: {
        ...mockProfile,
        email,
        full_name: fullName,
        phone,
      },
    };
  }

  static async signOut(): Promise<void> {
    // Clear token
  }
}
