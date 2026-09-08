import {
  auth,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from './firebase';
import mockUsers from '@/mocks/users';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

// Detect role from email domain
export function detectRoleFromEmail(email) {
  if (email.endsWith('@student.ac.in')) return 'student';
  if (email.endsWith('@faculty.ac.in')) return 'faculty';
  if (email.endsWith('@shopadmin.ac.in')) return 'shopadmin';
  if (email.endsWith('@admin.ac.in')) return 'admin';
  return null;
}

export async function loginWithEmail(email, password) {
  if (USE_MOCK) {
    // Mock login: find user in mock data
    const mockUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (!mockUser) {
      throw new Error('Invalid email or password.');
    }
    return { uid: mockUser.id, email: mockUser.email, role: mockUser.role, displayName: mockUser.name };
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  const tokenResult = await credential.user.getIdTokenResult();
  const role = tokenResult.claims.role || detectRoleFromEmail(email);
  return { uid: credential.user.uid, email: credential.user.email, role, displayName: credential.user.displayName };
}

export async function logout() {
  if (USE_MOCK) return;
  return signOut(auth);
}

export async function resetPassword(email) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    return true;
  }
  return sendPasswordResetEmail(auth, email);
}
