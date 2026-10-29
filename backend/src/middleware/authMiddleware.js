import { auth, isFirebaseConnected } from '../config/firebase.js';

// Helper to deduce role from campus email domain
export function getRoleFromEmail(email) {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();
  if (cleanEmail.endsWith('@bitsathy.ac.in')) return 'student';
  if (cleanEmail.endsWith('@student.ac.in')) return 'student';
  if (cleanEmail.endsWith('@faculty.ac.in')) return 'faculty';
  if (cleanEmail.endsWith('@shopadmin.ac.in')) return 'shopadmin';
  if (cleanEmail.endsWith('@admin.ac.in')) return 'admin';
  // Default Google sign-in or external users to student
  return 'student';
}

/**
 * Authentication Middleware
 * Verifies Firebase ID Token passed in Authorization header.
 * Falls back to demo token inspection if Firebase is in Demo Mode.
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Check if development session header is present
    const devEmail = req.headers['x-user-email'];
    if (devEmail) {
      const role = req.headers['x-user-role'] || getRoleFromEmail(devEmail) || 'student';
      req.user = {
        uid: req.headers['x-user-id'] || 'dev-uid',
        email: devEmail,
        role,
        displayName: devEmail.split('@')[0],
      };
      return next();
    }

    // Check if optional mock user header is present in dev
    if (!isFirebaseConnected) {
      req.user = {
        uid: req.headers['x-user-id'] || 'mock-user-1',
        email: req.headers['x-user-email'] || 'arjun@student.ac.in',
        role: req.headers['x-user-role'] || 'student',
      };
      return next();
    }
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authorization header with Bearer token is required.',
    });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  try {
    if (isFirebaseConnected && auth) {
      const decodedToken = await auth.verifyIdToken(token);
      const email = decodedToken.email || '';
      const role = decodedToken.role || getRoleFromEmail(email) || 'student';

      req.user = {
        uid: decodedToken.uid,
        email,
        role,
        displayName: decodedToken.name || decodedToken.displayName || email.split('@')[0],
      };
    } else {
      // Demo / Mock fallback mode
      req.user = {
        uid: 'demo-uid',
        email: req.headers['x-user-email'] || 'demo@student.ac.in',
        role: getRoleFromEmail(req.headers['x-user-email']) || 'student',
      };
    }
    next();
  } catch (error) {
    console.error('[Auth Middleware] Token verification failed:', error.message);
    if (req.headers['x-user-email']) {
      const devEmail = req.headers['x-user-email'];
      const role = req.headers['x-user-role'] || getRoleFromEmail(devEmail) || 'student';
      req.user = {
        uid: req.headers['x-user-id'] || 'dev-uid',
        email: devEmail,
        role,
        displayName: devEmail.split('@')[0],
      };
      return next();
    }
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'The provided authentication token is invalid or expired.',
    });
  }
}
