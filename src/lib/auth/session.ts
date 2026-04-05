import { getServerSession } from 'next-auth';
import { authOptions } from './options';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session?.user) return null;
  return session.user as SessionUser;
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
