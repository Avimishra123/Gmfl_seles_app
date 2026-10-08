import { useEffect, useState, useCallback } from 'react';
import { ApiService } from '../network/ApiService';
import { useApp } from '../store';

export function useHomeViewModel() {
  const { showToast, token } = useApp();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await ApiService.getDashboard(token);
        const text = await response.text();
        
        console.log('Dashboard API Response:', response.status, text);
        
        let data = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse dashboard JSON:', e);
        }

        if (response.ok && data) {
          setDashboardData(data.data || data);
        } else {
          showToast(data.message || 'Failed to fetch dashboard data.');
        }
      } catch (error) {
        console.error('Dashboard Error:', error);
        showToast('Network error while fetching dashboard.');
      } finally {
        setLoading(false);
      }
  }, [token, showToast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboardData,
    loading,
    refresh: fetchDashboard,
  };
}
