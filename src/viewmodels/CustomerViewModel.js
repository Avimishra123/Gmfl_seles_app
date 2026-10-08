import { useCallback, useEffect, useState } from 'react';
import { ApiService } from '../network/ApiService';
import { useApp } from '../store';

export function useCustomerViewModel(id, isApp = false) {
  const { showToast, token, setStatus: setLocalStatus } = useApp();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCustomer = useCallback(async () => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let response = isApp
        ? await ApiService.getApplicationDetails(token, id)
        : await ApiService.getLeadDetails(token, id);
        
      if (!isApp && !response.ok && response.status === 404) {
        const fallbackResponse = await ApiService.getApplicationDetails(token, id);
        if (fallbackResponse.ok) {
          response = fallbackResponse;
        }
      }
      
      const text = await response.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse customer JSON:', e);
      }

      if (response.ok && data && (data.data || Object.keys(data).length > 0)) {
        setCustomer(data.data || data);
      } else {
        if (response.status !== 404) {
          showToast(data.message || 'Failed to fetch customer data.');
        }
      }
    } catch (error) {
      console.error('Customer Error:', error);
      showToast('Network error while fetching customer data.');
    } finally {
      setLoading(false);
    }
  }, [token, id, isApp, showToast]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleLeadStatusUpdate = useCallback(async (newStatus, remarks = '') => {
    if (actionLoading) return false;
    if (newStatus === 'DROPPED' && (!remarks || remarks.trim().length < 5)) {
      showToast('Remarks explaining reason are required (min 5 characters)');
      return false;
    }
    setActionLoading(true);
    try {
      const payload = { status: newStatus };
      if (remarks && remarks.trim()) {
        payload.remarks = remarks.trim();
      }
      const response = await ApiService.updateLeadStatus(token, id, payload);
      const text = await response.text();
      let data = {};
      try { data = JSON.parse(text); } catch (e) {}

      if (response.ok) {
        showToast(`Lead marked as ${newStatus.replace(/_/g, ' ')}`);
        setLocalStatus(id, newStatus);
        await fetchCustomer();
        return true;
      } else {
        showToast(data.message || `Failed to update lead status to ${newStatus}`);
        return false;
      }
    } catch (err) {
      showToast('Network error updating lead status');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, token, id, showToast, setLocalStatus, fetchCustomer]);

  const handleAddLeadNote = useCallback(async (note) => {
    if (actionLoading) return false;
    if (!note || note.trim().length < 2) {
      showToast('Note must be at least 2 characters long');
      return false;
    }
    setActionLoading(true);
    try {
      const response = await ApiService.addLeadNote(token, id, { note: note.trim() });
      const text = await response.text();
      let data = {};
      try { data = JSON.parse(text); } catch (e) {}

      if (response.ok) {
        showToast('Follow-up note added');
        await fetchCustomer();
        return true;
      } else {
        showToast(data.message || 'Failed to add follow-up note');
        return false;
      }
    } catch (err) {
      showToast('Network error adding note');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, token, id, showToast, fetchCustomer]);

  const handleStatusUpdate = useCallback(async (newStatus, remarks = '') => {
    if (!isApp) {
      return handleLeadStatusUpdate(newStatus, remarks);
    }
    if (actionLoading) return false;
    setActionLoading(true);
    try {
      const response = await ApiService.updateApplicationStatus(token, id, {
        status: newStatus,
        remarks: remarks || `Status moved to ${newStatus} by salesperson`,
      });
      const text = await response.text();
      let data = {};
      try { data = JSON.parse(text); } catch (e) {}

      if (response.ok) {
        showToast(`Application moved to ${newStatus.replace(/_/g, ' ')}`);
        setLocalStatus(id, newStatus);
        await fetchCustomer();
        return true;
      } else {
        showToast(data.message || `Failed to update status to ${newStatus}`);
        return false;
      }
    } catch (err) {
      showToast('Network error updating status');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [isApp, handleLeadStatusUpdate, actionLoading, token, id, showToast, setLocalStatus, fetchCustomer]);

  const handleApprove = useCallback(async (remarks = 'Approved by salesperson') => {
    if (actionLoading) return false;
    setActionLoading(true);
    try {
      const response = await ApiService.approveApplication(token, id, remarks);
      const text = await response.text();
      let data = {};
      try { data = JSON.parse(text); } catch (e) {}

      if (response.ok) {
        showToast('Application approved successfully');
        setLocalStatus(id, 'Approved');
        await fetchCustomer();
        return true;
      } else {
        showToast(data.message || 'Cannot approve: check mandatory documents');
        return false;
      }
    } catch (err) {
      showToast('Network error approving application');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, token, id, showToast, setLocalStatus, fetchCustomer]);

  const handleReject = useCallback(async (remarks) => {
    if (actionLoading) return false;
    if (!remarks || remarks.trim().length < 5) {
      showToast('Rejection reason must be at least 5 characters');
      return false;
    }
    setActionLoading(true);
    try {
      const response = await ApiService.rejectApplication(token, id, remarks.trim());
      const text = await response.text();
      let data = {};
      try { data = JSON.parse(text); } catch (e) {}

      if (response.ok) {
        showToast('Application rejected');
        setLocalStatus(id, 'Rejected');
        await fetchCustomer();
        return true;
      } else {
        showToast(data.message || 'Failed to reject application');
        return false;
      }
    } catch (err) {
      showToast('Network error rejecting application');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, token, id, showToast, setLocalStatus, fetchCustomer]);

  const handleDisburse = useCallback(async (payload) => {
    if (actionLoading) return false;
    setActionLoading(true);
    try {
      const response = await ApiService.disburseApplication(token, id, payload);
      const text = await response.text();
      let data = {};
      try { data = JSON.parse(text); } catch (e) {}

      if (response.ok) {
        showToast('Loan disbursed successfully!');
        setLocalStatus(id, 'Completed');
        await fetchCustomer();
        return true;
      } else {
        showToast(data.message || 'Failed to disburse loan');
        return false;
      }
    } catch (err) {
      showToast('Network error disbursing loan');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, token, id, showToast, setLocalStatus, fetchCustomer]);

  return {
    customer,
    loading,
    actionLoading,
    refetch: fetchCustomer,
    handleStatusUpdate,
    handleLeadStatusUpdate,
    handleAddLeadNote,
    handleApprove,
    handleReject,
    handleDisburse,
  };
}
