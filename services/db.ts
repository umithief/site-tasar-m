
// Bu dosya gerçek bir veritabanını simüle eder.
// Verileri LocalStorage'da tutar.

const DB_KEYS = {
  USERS: 'mv_users',
  ORDERS: 'mv_orders',
  SESSION: 'mv_session',
  FORUM_TOPICS: 'mv_forum_topics',
  PRODUCTS: 'mv_products',
  SLIDES: 'mv_slides',
  CATEGORIES: 'mv_categories',
  ROUTES: 'mv_routes',
  MUSIC: 'mv_music',
  MODELS: 'mv_3d_models',
  LOGS: 'mv_system_logs',
  VISITOR_STATS: 'mv_visitor_stats',
  ANALYTICS: 'mv_analytics_events',
  RECORDINGS: 'mv_session_recordings',
  NEGOTIATIONS: 'mv_negotiations',
  FEEDBACK: 'mv_user_feedbacks',
  EVENTS: 'mv_events',
  STOLEN_ITEMS: 'mv_stolen_items'
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Storage read error', e);
    return defaultValue;
  }
}

export function setStorage<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (e: any) {
    // Handle Storage Quota Exceeded
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22) {
      console.warn(`Storage quota exceeded while saving ${key}. Initiating cleanup protocol...`);

      // Waterfall cleanup strategy
      const cleanupTargets = [
        DB_KEYS.RECORDINGS,
        DB_KEYS.ANALYTICS,
        DB_KEYS.LOGS,
        DB_KEYS.VISITOR_STATS,
        DB_KEYS.NEGOTIATIONS
      ];

      let recovered = false;

      for (const target of cleanupTargets) {
        if (key === target) continue;

        if (localStorage.getItem(target)) {
          console.log(`Attempting to recover space by deleting: ${target}`);
          localStorage.removeItem(target);

          try {
            const serializedRetry = JSON.stringify(value);
            localStorage.setItem(key, serializedRetry);
            console.log(`✅ Storage recovered. Saved ${key} successfully.`);
            recovered = true;
            break;
          } catch (retryErr) {
            console.warn(`⚠️ Clearing ${target} was not enough. Moving to next target...`);
          }
        }
      }

      if (!recovered) {
        console.error(`CRITICAL: Storage is full. Data lost for key: ${key}`);
      }
    } else {
      console.error('Storage write error', e);
    }
  }
}

export const DB = {
  USERS: DB_KEYS.USERS,
  ORDERS: DB_KEYS.ORDERS,
  SESSION: DB_KEYS.SESSION,
  FORUM_TOPICS: DB_KEYS.FORUM_TOPICS,
  PRODUCTS: DB_KEYS.PRODUCTS,
  SLIDES: DB_KEYS.SLIDES,
  CATEGORIES: DB_KEYS.CATEGORIES,
  ROUTES: DB_KEYS.ROUTES,
  MUSIC: DB_KEYS.MUSIC,
  MODELS: DB_KEYS.MODELS,
  LOGS: DB_KEYS.LOGS,
  VISITOR_STATS: DB_KEYS.VISITOR_STATS,
  ANALYTICS: DB_KEYS.ANALYTICS,
  RECORDINGS: DB_KEYS.RECORDINGS,
  NEGOTIATIONS: DB_KEYS.NEGOTIATIONS,
  FEEDBACK: DB_KEYS.FEEDBACK,
  STOLEN_ITEMS: DB_KEYS.STOLEN_ITEMS
};
