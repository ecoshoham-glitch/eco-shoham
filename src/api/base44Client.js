// Standalone local data layer — replaces Base44 SDK
// All data is stored in localStorage

const STORES = {};

function getStore(entityName) {
  const key = `ecoshoham_${entityName}`;
  if (!STORES[entityName]) {
    try {
      STORES[entityName] = JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      STORES[entityName] = [];
    }
  }
  return STORES[entityName];
}

function saveStore(entityName) {
  const key = `ecoshoham_${entityName}`;
  localStorage.setItem(key, JSON.stringify(STORES[entityName]));
}

function createEntity(entityName) {
  return {
    async list(sort, limit) {
      const items = getStore(entityName);
      const sorted = [...items];
      if (sort && sort.startsWith('-')) {
        const field = sort.slice(1);
        sorted.sort((a, b) => (b[field] || '').localeCompare?.(a[field] || '') || 0);
      }
      return limit ? sorted.slice(0, limit) : sorted;
    },
    async filter(criteria, sort) {
      let items = getStore(entityName);
      items = items.filter(item => {
        return Object.entries(criteria).every(([k, v]) => item[k] === v);
      });
      if (sort && sort.startsWith('-')) {
        const field = sort.slice(1);
        items.sort((a, b) => (b[field] || '').localeCompare?.(a[field] || '') || 0);
      }
      return items;
    },
    async create(data) {
      const store = getStore(entityName);
      const item = { ...data, id: Date.now().toString(), created_date: new Date().toISOString() };
      store.push(item);
      saveStore(entityName);
      return item;
    },
    async update(id, data) {
      const store = getStore(entityName);
      const index = store.findIndex(item => item.id === id || item.id === String(id));
      if (index !== -1) {
        store[index] = { ...store[index], ...data };
        saveStore(entityName);
        return store[index];
      }
      return null;
    },
    async delete(id) {
      const store = getStore(entityName);
      const index = store.findIndex(item => item.id === id || item.id === String(id));
      if (index !== -1) {
        store.splice(index, 1);
        saveStore(entityName);
      }
    },
  };
}

// Auth system using localStorage
const AUTH_KEY = 'ecoshoham_auth';
const TEACHER_USERS_KEY = 'ecoshoham_teacher_users';

function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
}

function getTeacherUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(TEACHER_USERS_KEY) || '[]');
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function saveTeacherUsers(users) {
  localStorage.setItem(TEACHER_USERS_KEY, JSON.stringify(users));
}

function normalizeUsername(username) {
  return (username || '').trim().toLowerCase();
}

/** אימייל (אותיות קטנות) או טלפון (ספרות בלבד, ללא מקפים/רווחים) */
function normalizeTeacherIdentifier(raw) {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  if (trimmed.includes('@')) return trimmed.toLowerCase();
  return trimmed.replace(/\D/g, '');
}

export const base44 = {
  entities: {
    Testimonial: createEntity('Testimonial'),
    PendingTestimonial: createEntity('PendingTestimonial'),
    CommunityPost: createEntity('CommunityPost'),
  },
  auth: {
    async me() {
      return getAuthUser();
    },
    // Email-only accounts (no password needed)
    EMAIL_ONLY_ADMINS: ['ecoshoham@gmail.com', 'motiash@educ.org.il'],
    // Password-protected accounts — הסיסמה מגיעה מ-VITE_ADMIN_PASSWORD (.env.local,
    // לא ב-git) ולא משורשרת כמחרוזת קבועה בקוד. שימו לב: זו עדיין לא הגנה אמיתית —
    // כל משתנה סביבה שמתחיל ב-VITE_ נארז בפועל לתוך ה-bundle הציבורי בזמן build
    // (כך ש-Vite עצמו חושף אותו לקוד לקוח), וכל האימות כאן קורה בצד הלקוח בלבד
    // (ראו login() למטה — כותב ל-localStorage בלי שום אימות שרת). ההגנה היחידה
    // האמיתית לחשבון admin@ecoshoham.co.il תדרוש backend אמיתי, שלא קיים כאן.
    PASSWORD_ADMINS: {
      'admin@ecoshoham.co.il': import.meta.env.VITE_ADMIN_PASSWORD || null,
    },
    login(username, password) {
      const trimmed = (username || '').trim();
      const normalizedAdminEmail = normalizeUsername(trimmed);
      // Email-only admin accounts
      if (this.EMAIL_ONLY_ADMINS.includes(normalizedAdminEmail)) {
        const user = { email: normalizedAdminEmail, role: 'admin', name: 'מנהל' };
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        return user;
      }
      // Password-protected admin accounts — null/undefined בכוונה לעולם לא תואם
      // לשום קלט (גם לא סיסמה ריקה), כדי שחשבון בלי VITE_ADMIN_PASSWORD מוגדר
      // יהיה חסום לגמרי, לא "פתוח בשוגג" עם סיסמה ריקה.
      if (this.PASSWORD_ADMINS[normalizedAdminEmail] && password && this.PASSWORD_ADMINS[normalizedAdminEmail] === password) {
        const user = { email: normalizedAdminEmail, role: 'admin', name: 'מנהל' };
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        return user;
      }

      // Teacher accounts (username can be email or phone)
      const teacherId = normalizeTeacherIdentifier(trimmed);
      const teacher = teacherId
        ? getTeacherUsers().find(
            (item) => normalizeTeacherIdentifier(item.username) === teacherId
          )
        : null;
      if (teacher) {
        const user = {
          username: teacher.username,
          email: teacher.username.includes('@') ? teacher.username : null,
          phone: teacher.username.includes('@') ? null : teacher.username,
          role: 'teacher',
          name: teacher.name || 'מורה',
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    },
    isEmailOnlyAdmin(username) {
      return this.EMAIL_ONLY_ADMINS.includes(normalizeUsername(username));
    },
    isPasswordRequired(username) {
      const normalizedUsername = normalizeUsername(username);
      return Boolean(this.PASSWORD_ADMINS[normalizedUsername]);
    },
    isTeacherUsername(username) {
      const teacherId = normalizeTeacherIdentifier(username);
      if (!teacherId) return false;
      return getTeacherUsers().some(
        (item) => normalizeTeacherIdentifier(item.username) === teacherId
      );
    },
    async listTeacherUsers() {
      return getTeacherUsers();
    },
    async createTeacherUser({ username, name }) {
      const teacherId = normalizeTeacherIdentifier(username);
      if (!teacherId) {
        throw new Error('Teacher username is required');
      }

      const users = getTeacherUsers();
      const exists = users.some((item) => normalizeTeacherIdentifier(item.username) === teacherId);
      if (exists) {
        throw new Error('Teacher user already exists');
      }

      const teacher = {
        id: Date.now().toString(),
        username: teacherId,
        name: (name || '').trim() || 'מורה',
        role: 'teacher',
        created_date: new Date().toISOString(),
      };
      users.push(teacher);
      saveTeacherUsers(users);
      return teacher;
    },
    async deleteTeacherUser(id) {
      const users = getTeacherUsers();
      const nextUsers = users.filter((item) => item.id !== id && item.id !== String(id));
      saveTeacherUsers(nextUsers);
    },
    logout(redirectUrl) {
      localStorage.removeItem(AUTH_KEY);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
    redirectToLogin(returnUrl) {
      window.location.href = `/admin?login=true&return=${encodeURIComponent(returnUrl || '/')}`;
    },
  },
  integrations: {
    Core: {
      async UploadFile({ file }) {
        // Convert file to data URL for localStorage storage
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ file_url: reader.result });
          reader.readAsDataURL(file);
        });
      },
    },
  },
};
