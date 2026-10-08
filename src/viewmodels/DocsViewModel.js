import { useCallback, useEffect, useState } from 'react';
import { ApiService } from '../network/ApiService';
import { useApp } from '../store';

export function useDocsViewModel(id, isApp = false) {
  const { showToast, token } = useApp();
  const [docsData, setDocsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDocs = useCallback(async () => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await ApiService.getApplicationDocuments(token, id);
      const text = await response.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse docs JSON:', e);
      }

      if (response.ok && data) {
        setDocsData(data.data || data);
      } else {
        showToast(data.message || 'Failed to fetch document checklist.');
      }
    } catch (error) {
      console.error('Docs Error:', error);
      showToast('Network error while fetching documents.');
    } finally {
      setLoading(false);
    }
  }, [token, id, showToast]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleApproveDocument = useCallback(
    async (docCode, remarks = 'Document verified by sales agent') => {
      if (actionLoading) return false;
      const cleanCode = String(docCode || '').trim().toUpperCase();
      if (!cleanCode) {
        showToast('Document code is required');
        return false;
      }
      setActionLoading(true);
      try {
        const response = await ApiService.approveApplicationDocument(token, id, cleanCode, remarks);
        const text = await response.text();
        let data = {};
        try { data = JSON.parse(text); } catch (e) {}

        if (response.ok) {
          showToast(data.message || `Document ${cleanCode} verified successfully`);
          await fetchDocs();
          return true;
        } else {
          showToast(data.message || `Failed to verify document ${cleanCode}`);
          return false;
        }
      } catch (err) {
        console.error('Document approve error:', err);
        showToast('Network error verifying document');
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [actionLoading, token, id, showToast, fetchDocs]
  );

  const handleRejectDocument = useCallback(
    async (docCode, remarks) => {
      if (actionLoading) return false;
      const cleanCode = String(docCode || '').trim().toUpperCase();
      if (!cleanCode) {
        showToast('Document code is required');
        return false;
      }
      if (!remarks || remarks.trim().length < 5) {
        showToast('Rejection reason must be at least 5 characters');
        return false;
      }
      setActionLoading(true);
      try {
        const response = await ApiService.rejectApplicationDocument(token, id, cleanCode, remarks.trim());
        const text = await response.text();
        let data = {};
        try { data = JSON.parse(text); } catch (e) {}

        if (response.ok) {
          showToast(data.message || `Document ${cleanCode} rejected`);
          await fetchDocs();
          return true;
        } else {
          showToast(data.message || `Failed to reject document ${cleanCode}`);
          return false;
        }
      } catch (err) {
        console.error('Document reject error:', err);
        showToast('Network error rejecting document');
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [actionLoading, token, id, showToast, fetchDocs]
  );

  const handleUploadDocument = useCallback(
    async (docPayload) => {
      if (actionLoading) return false;
      setActionLoading(true);
      try {
        const normalizedPayload = {
          ...docPayload,
          code: String(docPayload.code || '').trim().toUpperCase(),
        };
        const payload = normalizedPayload.documents
          ? normalizedPayload
          : { ...normalizedPayload, documents: [normalizedPayload] };
        const response = await ApiService.uploadApplicationDocument(token, id, payload);
        const text = await response.text();
        let data = {};
        try { data = JSON.parse(text); } catch (e) {}

        if (response.ok) {
          showToast(data.message || 'Document uploaded and auto-verified!');
          await fetchDocs();
          return true;
        } else {
          showToast(data.message || 'Failed to upload document');
          return false;
        }
      } catch (err) {
        console.error('Document upload error:', err);
        showToast('Network error uploading document');
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [actionLoading, token, id, showToast, fetchDocs]
  );

  const checklist = docsData?.checklist || docsData?.documents || [];
  const summary = docsData?.summary || null;

  return {
    docsData,
    checklist,
    summary,
    loading,
    actionLoading,
    refetch: fetchDocs,
    handleApproveDocument,
    handleRejectDocument,
    handleUploadDocument,
  };
}
