
const API_BASE_URL = '/api';

export const API_ROUTES = {
    PREFERENCES: `${API_BASE_URL}/preferences`,
    EVENTS: `${API_BASE_URL}/events`,
    CREATE_EVENT: `${API_BASE_URL}/events`,
    EVENT_BY_ID: (id: string) => `${API_BASE_URL}/events/${id}`,
    EVENT_STATUS: (id: string) => `${API_BASE_URL}/events/${id}/status`,
    SEED: `${API_BASE_URL}/seed`,
};

export const CONFIG = {
    SITE_NAME: 'Konkani Show Platform',
    SITE_DESCRIPTION: 'The ultimate platform for Konkani shows and events.',
    DEFAULT_OG_IMAGE: '/og-image.jpg',
};
