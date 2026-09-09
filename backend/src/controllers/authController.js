import { auth, db, isFirebaseConnected } from '../config/firebase.js';
import { getRoleFromEmail } from '../middleware/authMiddleware.js';

let memoryUsers = [
  {
    id: 'u1',
    name: 'Arjun Sharma',
    email: 'arjun@student.ac.in',
    role: 'student',
    department: 'Computer Science',
    rollNo: 'CS21B001',
  },
  {
    id: 'u3',
    name: 'Dr. Kavitha Menon',
    email: 'kavitha@faculty.ac.in',
    role: 'faculty',
    department: 'Computer Science',
    employeeId: 'FAC001',
  },
  {
    id: 'u5',
    name: 'Suresh Kumar',
    email: 'suresh@shopadmin.ac.in',
    role: 'shopadmin',
    department: 'Stationery Store',
  },
  {
    id: 'u6',
    name: 'Principal Admin',
    email: 'admin@admin.ac.in',
    role: 'admin',
  },
];

/**
 * POST /api/auth/sync-role
 * Sets custom user claims in Firebase Auth based on email domain
 */
export async function syncUserRole(req, res, next) {
  try {
    const { uid, email } = req.body;
    const targetUid = uid || req.user?.uid;
    const targetEmail = email || req.user?.email;

    if (!targetUid || !targetEmail) {
      return res.status(400).json({ error: 'BadRequest', message: 'User UID and email are required.' });
    }

    const detectedRole = getRoleFromEmail(targetEmail);
    if (!detectedRole) {
      return res.status(400).json({
        error: 'InvalidDomain',
        message: 'Email domain must end with @student.ac.in, @faculty.ac.in, @shopadmin.ac.in, or @admin.ac.in',
      });
    }

    if (isFirebaseConnected && auth) {
      // Set Firebase Auth custom claims
      await auth.setCustomUserClaims(targetUid, { role: detectedRole });

      // Sync metadata in Firestore
      if (db) {
        await db.collection('users').doc(targetUid).set(
          {
            uid: targetUid,
            email: targetEmail,
            role: detectedRole,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      return res.json({
        success: true,
        uid: targetUid,
        email: targetEmail,
        role: detectedRole,
        message: `Custom role claim '${detectedRole}' set successfully in Firebase.`,
      });
    }

    res.json({
      success: true,
      uid: targetUid,
      email: targetEmail,
      role: detectedRole,
      message: `[Demo Mode] Role assigned: ${detectedRole}`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 */
export async function getProfile(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'User session not found.' });
    }

    if (isFirebaseConnected && db && req.user.uid) {
      const doc = await db.collection('users').doc(req.user.uid).get();
      if (doc.exists) {
        return res.json({ uid: doc.id, ...doc.data() });
      }
    }

    const user = memoryUsers.find((u) => u.email === req.user.email) || req.user;
    res.json(user);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/accounts
 * For Campus Admin governance
 */
export async function getAccounts(req, res, next) {
  try {
    if (isFirebaseConnected && db) {
      const snapshot = await db.collection('users').get();
      if (!snapshot.empty) {
        return res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    }
    res.json(memoryUsers);
  } catch (error) {
    next(error);
  }
}
