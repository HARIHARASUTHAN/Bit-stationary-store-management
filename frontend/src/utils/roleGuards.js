export const ROLE_HOME_ROUTES = {
  student: '/student/dashboard',
  faculty: '/faculty/dashboard',
  shopadmin: '/shopadmin/dashboard',
  admin: '/admin/dashboard',
};

export const ALLOWED_DOMAINS = [
  'student.ac.in',
  'faculty.ac.in',
  'shopadmin.ac.in',
  'admin.ac.in',
];

export function validateEmailDomain(email) {
  if (!email) return false;
  const domain = email.split('@')[1];
  return ALLOWED_DOMAINS.includes(domain);
}

export function getRoleFromEmail(email) {
  if (!email) return null;
  const domain = email.split('@')[1];
  const map = {
    'student.ac.in': 'student',
    'faculty.ac.in': 'faculty',
    'shopadmin.ac.in': 'shopadmin',
    'admin.ac.in': 'admin',
  };
  return map[domain] || null;
}
