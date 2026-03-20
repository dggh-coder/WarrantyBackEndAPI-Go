export type UserRole = 'read' | 'write';

export interface UserProfile {
  username: string;
  role: UserRole;
}
