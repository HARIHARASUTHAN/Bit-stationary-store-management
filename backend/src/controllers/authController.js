import { auth, db, isFirebaseConnected } from '../config/firebase.js';
import { getRoleFromEmail } from '../middleware/authMiddleware.js';

export let memoryUsers = [];

/**
 * POST /api/auth/sync-role
 * Sets custom user claims in Firebase Auth based on email domain
 */
export async function syncUserRole(req, res, next) {
  try {
    const { uid, email, role } = req.body;
    const targetUid = uid || req.user?.uid;
    const targetEmail = email || req.user?.email;

    if (!targetUid || !targetEmail) {
      return res.status(400).json({ error: 'BadRequest', message: 'User UID and email are required.' });
    }

    const detectedRole = role || getRoleFromEmail(targetEmail) || 'student';

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
 * PUT /api/auth/profile
 * Allows users (especially Shop Admin & Students) to update their profile and contact info
 */
export async function updateProfile(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'User session not found.' });
    }

    const { name, shopName, phone, department, rollNumber, yearOfStudy, email } = req.body;
    const targetUid = req.user.uid;

    if (isFirebaseConnected && db && targetUid) {
      const updateData = {
        updatedAt: new Date().toISOString(),
      };
      if (name !== undefined) updateData.name = name;
      if (shopName !== undefined) updateData.shopName = shopName;
      if (phone !== undefined) updateData.phone = phone;
      if (department !== undefined) updateData.department = department;
      if (rollNumber !== undefined) updateData.rollNumber = rollNumber;
      if (yearOfStudy !== undefined) updateData.yearOfStudy = yearOfStudy;
      if (email !== undefined && email.trim()) updateData.email = email.trim();

      await db.collection('users').doc(targetUid).set(updateData, { merge: true });

      if (email && auth) {
        try {
          await auth.updateUser(targetUid, { email: email.trim() });
        } catch (authErr) {
          console.warn('[Update Profile] Notice updating Auth email:', authErr.message);
        }
      }

      // If Suresh updates shop name, keep default settings in sync
      if (shopName && req.user.email === 'suresh@shopadmin.ac.in') {
        await db.collection('settings').doc('shop').set(
          {
            shopName,
            updatedBy: req.user.email,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      const doc = await db.collection('users').doc(targetUid).get();
      return res.json({ uid: doc.id, ...doc.data() });
    }

    // In-memory fallback
    let userIndex = memoryUsers.findIndex((u) => u.email === req.user.email);
    if (userIndex !== -1) {
      memoryUsers[userIndex] = {
        ...memoryUsers[userIndex],
        ...(name && { name }),
        ...(shopName && { shopName }),
        ...(phone && { phone }),
        ...(department && { department }),
        ...(rollNumber && { rollNumber }),
        ...(yearOfStudy && { yearOfStudy }),
        ...(email && { email }),
      };
      return res.json(memoryUsers[userIndex]);
    }

    const updated = {
      ...req.user,
      name: name || req.user.displayName,
      shopName: shopName || 'BIT Central Stationery Store',
      email: email || req.user.email,
    };
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/change-password
 * Allows authenticated user to update their login password
 */
export async function changePassword(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'User session not found.' });
    }

    const { newPassword } = req.body;
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 6 characters long.',
      });
    }

    const targetUid = req.user.uid;
    if (isFirebaseConnected && auth && targetUid) {
      await auth.updateUser(targetUid, { password: String(newPassword) });
    }

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/shop-info
 * Returns current campus shop details so all users (including students) get the latest shop name
 */
export async function getShopInfo(req, res, next) {
  try {
    let shopAdmins = [];
    let primaryShopName = 'RASE MECH';

    if (isFirebaseConnected && db) {
      const shopAdminSnapshot = await db
        .collection('users')
        .where('role', '==', 'shopadmin')
        .get();

      if (!shopAdminSnapshot.empty) {
        shopAdmins = shopAdminSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }
    } else {
      shopAdmins = memoryUsers.filter((u) => u.role === 'shopadmin');
    }

    // Exclude deactivated accounts
    shopAdmins = shopAdmins.filter((a) => a.active !== false);

    const suresh = shopAdmins.find((u) => u.email === 'suresh@shopadmin.ac.in');
    if (suresh && suresh.shopName) {
      primaryShopName = suresh.shopName;
    }

    const palette = [
      { color: 'bg-[#065f46]', textColor: 'text-white', accentColor: '#065f46', badge: 'Central Depot' },
      { color: 'bg-[#1e3a5f]', textColor: 'text-white', accentColor: '#1e3a5f', badge: 'Stationery Desk' },
      { color: 'bg-[#1a3a3a]', textColor: 'text-white', accentColor: '#1a3a3a', badge: 'Campus Outlet' },
      { color: 'bg-[#e8b94a]', textColor: 'text-[#0a0a0a]', accentColor: '#e8b94a', badge: 'Branch Store' },
    ];

    const usedIds = new Set();
    const mappedShops = shopAdmins.map((admin, idx) => {
      const rawName = (admin.shopName || admin.name || 'Campus Stationery Desk').trim();
      const isMainStore = admin.email === 'suresh@shopadmin.ac.in' || rawName.toLowerCase() === 'rase mech';
      const isSisBit = admin.email === 'sisbit@shopadmin.ac.in' || rawName.toLowerCase() === 'sis bit';

      let id = isMainStore
        ? 'main-store'
        : isSisBit
        ? 'sis-bit'
        : (admin.shopId || `shop-${rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);

      if (usedIds.has(id)) {
        id = `${id}-${idx + 1}`;
      }
      usedIds.add(id);

      const displayName = rawName;
      const counter = isMainStore
        ? 'Main Store'
        : isSisBit
        ? 'SIS Desk'
        : (admin.department || `${displayName} Desk`);

      const style = palette[idx % palette.length];

      return {
        id,
        name: displayName,
        email: admin.email,
        tagline: admin.department && admin.department !== 'Stationery Store'
          ? admin.department
          : isMainStore
          ? 'Main Academic Block (Ground Floor)'
          : isSisBit
          ? 'Stationery Store Desk (Near Admin Block)'
          : `${displayName} Counter`,
        badge: style.badge,
        description: `Official campus stationery and academic supplies managed by ${admin.name || displayName}.`,
        operatingHours: admin.operatingHours || (isMainStore ? '8:30 AM – 6:00 PM' : '9:00 AM – 5:00 PM'),
        counter,
        categories: ['Writing Instruments', 'Notebooks & Paper', 'Geometry & Drafting', 'Lab Supplies', 'Office Supplies'],
        color: style.color,
        textColor: style.textColor,
        accentColor: style.accentColor,
      };
    });

    res.json({
      shopName: primaryShopName,
      shops: mappedShops,
    });
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
        const users = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            uid: d.id,
            active: data.active !== false,
            ...data,
          };
        });
        return res.json(users);
      }
    }
    res.json(memoryUsers);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/accounts
 * Provisions a new Shop Admin user in Firebase Auth and Cloud Firestore
 */
export async function createAccount(req, res, next) {
  try {
    const { name, email, department, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Name and institutional email are required.',
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanDept = (department || 'Stationery Store Desk').trim();
    const cleanShopName = (req.body.shopName || cleanName).trim();
    const rawPassword = password || 'tempPassword123';

    if (rawPassword.length < 6) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Password must be at least 6 characters long.',
      });
    }

    let uid = null;

    if (isFirebaseConnected && db) {
      // 1. Create or sync user in Firebase Auth
      if (auth) {
        try {
          const existingUser = await auth.getUserByEmail(cleanEmail);
          uid = existingUser.uid;
          await auth.updateUser(uid, {
            displayName: cleanName,
            password: rawPassword,
            disabled: false,
          });
        } catch (err) {
          if (err.code === 'auth/user-not-found') {
            const newUser = await auth.createUser({
              email: cleanEmail,
              password: rawPassword,
              displayName: cleanName,
              disabled: false,
            });
            uid = newUser.uid;
          } else {
            console.error('[Create Account] Firebase Auth error:', err.message);
          }
        }

        // Set custom user claims for shopadmin role
        if (uid) {
          try {
            await auth.setCustomUserClaims(uid, { role: 'shopadmin' });
          } catch (claimErr) {
            console.warn('[Create Account] Warning setting custom claims:', claimErr.message);
          }
        }
      }

      // If uid not created via auth, generate a doc id
      if (!uid) {
        uid = `shopadmin_${Date.now()}`;
      }

      // 2. Persist to Cloud Firestore 'users' collection
      const newAccountData = {
        id: uid,
        uid,
        name: cleanName,
        email: cleanEmail,
        shopName: cleanShopName,
        shopId: `shop-${cleanShopName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        role: 'shopadmin',
        department: cleanDept,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection('users').doc(uid).set(newAccountData, { merge: true });
      console.log(`✅ [Create Account] Saved shopadmin account to Firestore: ${cleanEmail} (${uid})`);

      // 3. Keep in-memory cache synchronized
      const existingIdx = memoryUsers.findIndex((u) => u.email === cleanEmail || u.id === uid);
      if (existingIdx !== -1) {
        memoryUsers[existingIdx] = { ...memoryUsers[existingIdx], ...newAccountData };
      } else {
        memoryUsers.unshift(newAccountData);
      }

      return res.status(201).json({
        success: true,
        message: `Shop admin account created for ${cleanName}.`,
        account: newAccountData,
      });
    }

    // Demo Mode Fallback
    const demoId = `u-${Date.now()}`;
    const demoAccount = {
      id: demoId,
      uid: demoId,
      name: cleanName,
      email: cleanEmail,
      shopName: cleanShopName,
      shopId: `shop-${cleanShopName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      role: 'shopadmin',
      department: cleanDept,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryUsers.unshift(demoAccount);

    return res.status(201).json({
      success: true,
      message: `[Demo Mode] Shop admin account created for ${cleanName}.`,
      account: demoAccount,
    });
  } catch (error) {
    console.error('[Create Account Error]:', error);
    next(error);
  }
}

/**
 * PATCH /api/auth/accounts/:id/status
 * Enables or disables a shop admin account
 */
export async function toggleAccountStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (active === undefined) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Status field (active) is required.',
      });
    }

    const isActive = Boolean(active);

    if (isFirebaseConnected && db) {
      let docRef = db.collection('users').doc(id);
      let docSnap = await docRef.get();

      if (!docSnap.exists) {
        const querySnap = await db.collection('users').where('id', '==', id).limit(1).get();
        if (!querySnap.empty) {
          docRef = querySnap.docs[0].ref;
          docSnap = querySnap.docs[0];
        }
      }

      if (docSnap.exists) {
        await docRef.set(
          {
            active: isActive,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } else {
        await docRef.set(
          {
            id,
            active: isActive,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      // Update Firebase Auth disabled status if auth available
      if (auth) {
        try {
          await auth.updateUser(id, { disabled: !isActive });
        } catch (_) { }
      }
    }

    // Sync in-memory fallback
    const memUser = memoryUsers.find((u) => u.id === id || u.uid === id);
    if (memUser) {
      memUser.active = isActive;
    }

    res.json({
      success: true,
      id,
      active: isActive,
      message: `Account status updated to ${isActive ? 'Active' : 'Deactivated'}.`,
    });
  } catch (error) {
    console.error('[Toggle Account Status Error]:', error);
    next(error);
  }
}

/**
 * DELETE /api/auth/accounts/:id
 * Permanently deletes a shop admin account from Cloud Firestore and Firebase Auth
 */
export async function deleteAccount(req, res, next) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Account ID is required.',
      });
    }

    let deletedEmail = null;

    if (isFirebaseConnected && db) {
      let docRef = db.collection('users').doc(id);
      let docSnap = await docRef.get();

      if (!docSnap.exists) {
        const querySnap = await db.collection('users').where('id', '==', id).limit(1).get();
        if (!querySnap.empty) {
          docRef = querySnap.docs[0].ref;
          docSnap = querySnap.docs[0];
        }
      }

      if (docSnap.exists) {
        const data = docSnap.data();
        deletedEmail = data.email;
        await docRef.delete();
        console.log(`✅ [Delete Account] Deleted account ${id} (${deletedEmail}) from Firestore`);
      }

      // Delete user from Firebase Auth if auth is enabled
      if (auth) {
        try {
          await auth.deleteUser(id);
        } catch (authErr) {
          if (deletedEmail) {
            try {
              const userByEmail = await auth.getUserByEmail(deletedEmail);
              if (userByEmail) {
                await auth.deleteUser(userByEmail.uid);
              }
            } catch (_) {}
          }
        }
      }
    }

    // Sync in-memory fallback
    const memIdx = memoryUsers.findIndex(
      (u) => u.id === id || u.uid === id || (deletedEmail && u.email === deletedEmail)
    );
    if (memIdx !== -1) {
      memoryUsers.splice(memIdx, 1);
    }

    res.json({
      success: true,
      id,
      message: 'Account deleted successfully.',
    });
  } catch (error) {
    console.error('[Delete Account Error]:', error);
    next(error);
  }
}
