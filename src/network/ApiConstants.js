// Local backend API configuration
export const LOCAL_BASE_URL = 'http://192.168.29.11:5000';
export const CLOUD_BASE_URL = 'https://api-lr3oqftv5q-el.a.run.app';

export const ApiConstants = {
  // Using original Cloud API URL for production release
  BASE_URL: CLOUD_BASE_URL,
  LOGIN_ENDPOINT: '/api/agent/auth/login',
  LOGOUT_ENDPOINT: '/api/agent/auth/logout',
  REFRESH_TOKEN_ENDPOINT: '/api/agent/auth/refresh-token',
  PROFILE_ENDPOINT: '/api/agent/auth/profile',
  DEVICE_TOKEN_ENDPOINT: '/api/agent/notifications/device-token',
  NOTIFICATIONS_ENDPOINT: '/api/agent/notifications',
  NOTIFICATIONS_READ_ALL_ENDPOINT: '/api/agent/notifications/read-all',
  NOTIFICATIONS_READ_ENDPOINT: (id) => `/api/agent/notifications/${id}/read`,
  DASHBOARD_ENDPOINT: '/api/agent/dashboard',
  LEADS_ENDPOINT: '/api/agent/leads',
  LEAD_DETAILS_ENDPOINT: (id) => `/api/agent/leads/${id}`,
  APPLICATIONS_ENDPOINT: '/api/agent/applications',
  APPLICATION_DETAILS_ENDPOINT: (id) => `/api/agent/applications/${id}`,
  APPLICATION_DOCS_ENDPOINT: (id) => `/api/agent/applications/${id}/documents`,
  APPLICATION_DOC_STATUS_ENDPOINT: (id, docCode) => `/api/agent/applications/${id}/documents/${docCode}`,
  APPLICATION_DOC_APPROVE_ENDPOINT: (id, docCode) => `/api/agent/applications/${id}/documents/${docCode}/approve`,
  APPLICATION_DOC_REJECT_ENDPOINT: (id, docCode) => `/api/agent/applications/${id}/documents/${docCode}/reject`,
  APPLICATION_STATUS_ENDPOINT: (id) => `/api/agent/applications/${id}/status`,
  APPLICATION_APPROVE_ENDPOINT: (id) => `/api/agent/applications/${id}/approve`,
  APPLICATION_REJECT_ENDPOINT: (id) => `/api/agent/applications/${id}/reject`,
  APPLICATION_DISBURSE_ENDPOINT: (id) => `/api/agent/applications/${id}/disburse`,
  APPLICATION_METRICS_ENDPOINT: '/api/agent/applications/metrics',
  LEAD_METRICS_ENDPOINT: '/api/agent/leads/metrics',
  LEAD_STATUS_ENDPOINT: (id) => `/api/agent/leads/${id}/status`,
  LEAD_NOTES_ENDPOINT: (id) => `/api/agent/leads/${id}/notes`,
  CATEGORIES_ENDPOINT: '/api/categories',
};
