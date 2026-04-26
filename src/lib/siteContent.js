const STORAGE_KEY = 'ecoshoham_site_content';

export const defaultContent = {
  hero: {
    badge: 'חדשנות בלמידת מדעים',
    title: 'ECOShoham: להחזיק את המדע בידיים',
    subtitle: 'הופכים למידה מופשטת לחוויה מוחשית בלתי נשכחת',
    description: 'ערכות למידה אקטיבית המבוססות על מחקר קוגניטיבי, לשיפור מוכח של עד 55% בהישגי התלמידים. דרך חוויה חושית ומגע פיזי, התלמידים יוצרים עוגני זיכרון חזקים ומפחיתים עומס קוגניטיבי.',
    image: '/images/b82c137a8_Gemini_Generated_Image_ze7oq0ze7oq0ze7o.png',
    cta_primary: 'למידע מקצועי ודרכי התקשרות',
    cta_secondary: 'קראו עלינו',
  },
  about: {
    title: 'מה זה ECOShoham?',
    description: 'ECOShoham מפתחת ערכות למידה המבוססות על עקרונות של Embodied Cognition (למידה מעוגנת גוף). דרך מגע, פירוק והרכבה של מודלים תלת-מימדיים, התלמידים יוצרים עוגני זיכרון חזקים וממשיים המפחיתים עומס קוגניטיבי ומעמיקים הבנה מושגית.',
  },
  scienceProof: {
    stat: '55%',
    statLabel: 'שיפור בהישגי התלמידים',
    title: 'הוכחה מדעית',
    description: 'מחקרים (כגון Freeman et al., PNAS) מוכיחים כי למידה אקטיבית המערבת מגע, פירוק והרכבה מפחיתה דרמטית את שיעורי הכישלון ומעמיקה את ההבנה המושגית במקצועות ה-STEM.',
  },
  contact: {
    email: 'ecoshoham@gmail.com',
    whatsapp: 'https://wa.me/972503366993',
    whatsappText: 'צרו קשר בוואטסאפ',
  },
  stats: {
    schools: '100+',
    students: '15K+',
    satisfaction: '98%',
  },
};

export function getSiteContent() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultContent;
    const parsed = JSON.parse(stored);
    // Deep merge with defaults
    return deepMerge(defaultContent, parsed);
  } catch {
    return defaultContent;
  }
}

export function setSiteContent(content) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  window.dispatchEvent(new CustomEvent('siteContentUpdated', { detail: content }));
}

export function resetSiteContent() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('siteContentUpdated', { detail: defaultContent }));
}

function deepMerge(defaults, overrides) {
  const result = { ...defaults };
  for (const key in overrides) {
    if (overrides[key] && typeof overrides[key] === 'object' && !Array.isArray(overrides[key])) {
      result[key] = deepMerge(defaults[key] || {}, overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  }
  return result;
}