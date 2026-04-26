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

function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
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
    // Password-protected accounts
    PASSWORD_ADMINS: { 'admin@ecoshoham.co.il': 'admin123' },
    login(email, password) {
      // Email-only admin accounts
      if (this.EMAIL_ONLY_ADMINS.includes(email)) {
        const user = { email, role: 'admin', name: 'מנהל' };
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        return user;
      }
      // Password-protected admin accounts
      if (this.PASSWORD_ADMINS[email] && this.PASSWORD_ADMINS[email] === password) {
        const user = { email, role: 'admin', name: 'מנהל' };
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    },
    isEmailOnlyAdmin(email) {
      return this.EMAIL_ONLY_ADMINS.includes(email);
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
