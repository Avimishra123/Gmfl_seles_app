import { Platform } from 'react-native';
import { ApiConstants } from './ApiConstants';

export const ApiService = {
  async login(username, password) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.LOGIN_ENDPOINT}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return response;
  },

  async registerDeviceToken(token, deviceToken, deviceId = 'android') {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.DEVICE_TOKEN_ENDPOINT}`;
    
    // Extract agentId from token payload if required by backend
    let agentId = null;
    try {
      const payload = token.split('.')[1];
      let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }

      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let str = base64.replace(/=+$/, '');
      let output = '';
      for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = chars.indexOf(buffer);
      }
      
      const decoded = JSON.parse(output);
      agentId = decoded.id || decoded.agentId || decoded.userId;
    } catch (e) {
      console.warn('Failed to parse agentId from token', e);
    }

    const bodyPayload = {
      token: deviceToken,
      deviceType: Platform.OS === 'ios' ? 'ios' : 'android',
      deviceId: deviceId || 'android',
    };

    if (agentId) {
      bodyPayload.agentId = agentId;
      bodyPayload.agent_id = agentId;
    }

    return await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bodyPayload),
    });
  },

  async getNotifications(token, page = 1, limit = 50) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.NOTIFICATIONS_ENDPOINT}?page=${page}&limit=${limit}`;
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async markNotificationRead(token, id) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.NOTIFICATIONS_READ_ENDPOINT(id)}`;
    return await fetch(url, {
      method: 'PATCH',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async markAllNotificationsRead(token) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.NOTIFICATIONS_READ_ALL_ENDPOINT}`;
    return await fetch(url, {
      method: 'PATCH',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async unregisterDeviceToken(token, deviceToken) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.DEVICE_TOKEN_ENDPOINT}`;
    return await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ token: deviceToken }),
    });
  },

  async logout(token, refreshToken) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.LOGOUT_ENDPOINT}`;
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ refreshToken }),
    });
  },

  async refreshToken(refreshToken) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.REFRESH_TOKEN_ENDPOINT}`;
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
  },

  async getProfile(token) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.PROFILE_ENDPOINT}`;
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async getDashboard(token) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.DASHBOARD_ENDPOINT}`;
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async getLeads(token, options = {}) {
    let page = 1;
    let limit = 20;
    let status = null;
    let serviceId = null;
    let search = null;

    if (typeof options === 'number') {
      page = options;
      limit = arguments[2] || 20;
    } else if (typeof options === 'object') {
      page = options.page || 1;
      limit = options.limit || 20;
      status = options.status || null;
      serviceId = options.serviceId || null;
      search = options.search || null;
    }

    const queryParts = [`page=${page}`, `limit=${limit}`];
    if (status && status !== 'ALL') queryParts.push(`status=${encodeURIComponent(status)}`);
    if (serviceId && serviceId !== 'ALL') queryParts.push(`serviceId=${encodeURIComponent(serviceId)}`);
    if (search && search.trim()) queryParts.push(`search=${encodeURIComponent(search.trim())}`);

    const url = `${ApiConstants.BASE_URL}${ApiConstants.LEADS_ENDPOINT}?${queryParts.join('&')}`;
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async getLeadDetails(token, id) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.LEAD_DETAILS_ENDPOINT(id)}`;
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async getLeadMetrics(token) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.LEAD_METRICS_ENDPOINT}`;
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async updateLeadStatus(token, id, payload) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.LEAD_STATUS_ENDPOINT(id)}`;
    return await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  async addLeadNote(token, id, payload) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.LEAD_NOTES_ENDPOINT(id)}`;
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  async getApplications(token, options = {}) {
    let page = 1;
    let limit = 20;
    let status = null;
    let serviceId = null;
    let search = null;

    if (typeof options === 'number') {
      page = options;
      limit = arguments[2] || 20;
    } else if (typeof options === 'object') {
      page = options.page || 1;
      limit = options.limit || 20;
      status = options.status || null;
      serviceId = options.serviceId || null;
      search = options.search || null;
    }

    const queryParts = [`page=${page}`, `limit=${limit}`];
    if (status && status !== 'ALL') queryParts.push(`status=${encodeURIComponent(status)}`);
    if (serviceId && serviceId !== 'ALL') queryParts.push(`serviceId=${encodeURIComponent(serviceId)}`);
    if (search && search.trim()) queryParts.push(`search=${encodeURIComponent(search.trim())}`);

    const url = `${ApiConstants.BASE_URL}${ApiConstants.APPLICATIONS_ENDPOINT}?${queryParts.join('&')}`;
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async getApplicationMetrics(token) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.APPLICATION_METRICS_ENDPOINT}`;
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async getCategories(token) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.CATEGORIES_ENDPOINT}`;
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async getApplicationDetails(token, id) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.APPLICATION_DETAILS_ENDPOINT(id)}`;
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async getApplicationDocuments(token, id) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.APPLICATION_DOCS_ENDPOINT(id)}`;
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async uploadApplicationDocument(token, id, payload) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.APPLICATION_DOCS_ENDPOINT(id)}`;
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  async approveApplicationDocument(token, id, docCode, remarks = 'Document verified by sales agent') {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.APPLICATION_DOC_APPROVE_ENDPOINT(id, docCode)}`;
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ remarks }),
    });
  },

  async rejectApplicationDocument(token, id, docCode, remarks) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.APPLICATION_DOC_REJECT_ENDPOINT(id, docCode)}`;
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ remarks }),
    });
  },

  async updateDocumentStatus(token, id, docCode, status, remarks = '') {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.APPLICATION_DOC_STATUS_ENDPOINT(id, docCode)}`;
    return await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status, remarks }),
    });
  },

  async updateApplicationStatus(token, id, payload) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.APPLICATION_STATUS_ENDPOINT(id)}`;
    return await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  async approveApplication(token, id, remarks = 'Approved by salesperson') {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.APPLICATION_APPROVE_ENDPOINT(id)}`;
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ remarks }),
    });
  },

  async rejectApplication(token, id, remarks) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.APPLICATION_REJECT_ENDPOINT(id)}`;
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ remarks }),
    });
  },

  async disburseApplication(token, id, payload) {
    const url = `${ApiConstants.BASE_URL}${ApiConstants.APPLICATION_DISBURSE_ENDPOINT(id)}`;
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },
};
