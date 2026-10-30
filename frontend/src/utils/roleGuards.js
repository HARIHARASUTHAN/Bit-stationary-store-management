export const ROLE_HOME_ROUTES = {
  student: '/student/dashboard',
  faculty: '/faculty/dashboard',
  shopadmin: '/shopadmin/dashboard',
  admin: '/admin/dashboard',
};

export const ALLOWED_DOMAINS = [
  'bitsathy.ac.in',
  'student.ac.in',
  'shopadmin.ac.in',
  'admin.ac.in',
];

export function validateEmailDomain(email) {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  const domain = clean.split('@')[1];
  return ALLOWED_DOMAINS.includes(domain);
}

export function getRoleFromEmail(email) {
  if (!email) return null;
  const clean = email.toLowerCase().trim();
  const domain = clean.split('@')[1];

  if (domain === 'shopadmin.ac.in') return 'shopadmin';
  if (domain === 'admin.ac.in') return 'admin';
  if (domain === 'student.ac.in') return 'student';

  if (domain === 'bitsathy.ac.in') {
    const localPart = clean.split('@')[0];
    if (localPart === 'arjun' || localPart.startsWith('student') || localPart.startsWith('roll') || /^\d/.test(localPart)) {
      return 'student';
    }
    // Faculty members at BIT Sathy log in through their institutional @bitsathy.ac.in mail
    return 'faculty';
  }

  return 'student';
}
