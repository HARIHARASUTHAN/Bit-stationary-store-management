export const ROLE_HOME_ROUTES = {
  student: '/student/dashboard',
  faculty: '/faculty/dashboard',
  shopadmin: '/shopadmin/dashboard',
  admin: '/admin/dashboard',
};

export const ALLOWED_DOMAINS = [
  'bitsathy.ac.in',
  'student.ac.in',
  'faculty.ac.in',
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
  const map = {
    'bitsathy.ac.in': 'student',
    'student.ac.in': 'student',
    'faculty.ac.in': 'faculty',
    'shopadmin.ac.in': 'shopadmin',
    'admin.ac.in': 'admin',
  };
  return map[domain] || 'student';
}
