import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from './firebase';
import mockUsers from '@/mocks/users';
import api from './api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

// Detect role from email domain
export function detectRoleFromEmail(email) {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();

  if (cleanEmail.endsWith('@shopadmin.ac.in')) return 'shopadmin';
  if (cleanEmail.endsWith('@admin.ac.in')) return 'admin';
  if (cleanEmail.endsWith('@student.ac.in')) return 'student';

  if (cleanEmail.endsWith('@bitsathy.ac.in')) {
    const localPart = cleanEmail.split('@')[0];

    // Explicit known demo student or student roll prefix
    if (localPart === 'arjun' || localPart.startsWith('student') || localPart.startsWith('roll')) {
      return 'student';
    }

    // BIT student roll numbers start with digits (e.g. 7376222AD101 or 21CS101)
    if (/^\d/.test(localPart)) {
      return 'student';
    }

    // Faculty members at BIT Sathy log in through their institutional @bitsathy.ac.in mail (e.g. kavitha@bitsathy.ac.in)
    return 'faculty';
  }

  // Default general domain accounts (e.g. gmail.com) to student
  return 'student';
}

export async function loginWithGoogle(preferredRole = null) {
  if (USE_MOCK || !auth) {
    // Return a mock student for test environments without live firebase credentials
    const mockStudent = mockUsers[0];
    return {
      uid: mockStudent.id,
      email: mockStudent.email,
      role: preferredRole || 'student',
      displayName: mockStudent.name,
      photoURL: null,
    };
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(auth, provider);
  const email = credential.user.email || '';
  const role = preferredRole || detectRoleFromEmail(email) || 'student';
  const displayName = credential.user.displayName || email.split('@')[0];

  // Sync role to backend Firestore in background
  api.post('/auth/sync-role', { uid: credential.user.uid, email, role }).catch(() => {});

  return {
    uid: credential.user.uid,
    email: credential.user.email,
    role,
    displayName,
    photoURL: credential.user.photoURL,
  };
}

export async function loginWithEmail(email, password, preferredRole = null) {
  if (USE_MOCK || !auth) {
    // Mock login: find user in mock data
    const mockUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (!mockUser) {
      throw new Error('Invalid email or password.');
    }
    return { uid: mockUser.id, email: mockUser.email, role: preferredRole || mockUser.role, displayName: mockUser.name };
  }

  let credential;
  try {
    credential = await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    // If user does not exist in Firebase Auth yet, automatically register them
    if (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/invalid-login-credentials'
    ) {
      try {
        credential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (createErr) {
        throw new Error(createErr.message || 'Authentication failed.');
      }
    } else {
      throw err;
    }
  }

  const role = preferredRole || detectRoleFromEmail(email) || 'student';
  const displayName = email.split('@')[0];

  // Sync role to backend Firestore in background
  api.post('/auth/sync-role', { uid: credential.user.uid, email, role }).catch(() => {});

  return {
    uid: credential.user.uid,
    email: credential.user.email,
    role,
    displayName: credential.user.displayName || displayName,
  };
}

export async function logout() {
  if (USE_MOCK || !auth) return;
  return signOut(auth);
}

export async function resetPassword(email) {
  if (USE_MOCK || !auth) {
    await new Promise((r) => setTimeout(r, 800));
    return true;
  }
  return sendPasswordResetEmail(auth, email);
}

export async function getProfile() {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) {
    const saved = localStorage.getItem('bsp_user_session');
    return saved ? JSON.parse(saved) : null;
  }
}

export async function updateProfile(data) {
  try {
    const res = await api.put('/auth/profile', data);
    return res.data;
  } catch (err) {
    // Local storage fallback
    const saved = localStorage.getItem('bsp_user_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      const updated = { ...parsed, ...data };
      localStorage.setItem('bsp_user_session', JSON.stringify(updated));
      return updated;
    }
    return data;
  }
}

export async function changePassword(newPassword) {
  try {
    const res = await api.post('/auth/change-password', { newPassword });
    return res.data;
  } catch (err) {
    if (USE_MOCK || !auth?.currentUser) {
      await new Promise((r) => setTimeout(r, 600));
      return { success: true, message: 'Password updated successfully (Mock Mode).' };
    }
    // Attempt client-side Firebase update if backend route was blocked
    try {
      const { updatePassword } = await import('firebase/auth');
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        return { success: true };
      }
    } catch (clientErr) {
      throw new Error(err.response?.data?.message || clientErr.message || 'Failed to update password');
    }
    throw new Error(err.response?.data?.message || 'Failed to update password');
  }
}

export async function getShopInfo() {
  try {
    const res = await api.get('/auth/shop-info');
    return res.data;
  } catch (err) {
    return { shopName: localStorage.getItem('bsp_custom_shop_name') || 'BIT Central Stationery Store' };
  }
}
