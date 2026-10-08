import { useState, useEffect } from 'react';
import { ApiService } from '../network/ApiService';
import { useApp } from '../store';

export function useProfileViewModel() {
  const { token, showToast } = useApp();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!token) return;
      try {
        const response = await ApiService.getProfile(token);
        const text = await response.text();
        let data = {};
        try {
          data = JSON.parse(text);
        } catch (e) {}

        if (response.ok && data.success) {
          setProfile(data.data);
        } else {
          showToast(data.message || 'Failed to load profile');
        }
      } catch (error) {
        showToast('Network error loading profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [token, showToast]);

  return { profile, loading };
}
