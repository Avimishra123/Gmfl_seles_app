import { useEffect, useState, useCallback, useRef } from 'react';
import { ApiService } from '../network/ApiService';
import { useApp } from '../store';

export const LEAD_STATUS_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'NEW', label: 'New' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'FOLLOW_UP', label: 'Follow Up' },
  { key: 'CONVERTED', label: 'Converted' },
  { key: 'DROPPED', label: 'Dropped' },
];

export function useLeadsViewModel() {
  const { showToast, token } = useApp();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 20;

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimeoutRef = useRef(null);

  const handleSetSearch = useCallback((text) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(text);
    }, 300);
  }, []);

  const fetchMetrics = useCallback(async () => {
    if (!token) return;
    try {
      const res = await ApiService.getLeadMetrics(token);
      if (res.ok) {
        const json = await res.json();
        setMetrics(json.data || json);
      }
    } catch {
      // Metrics are non-blocking enhancement
    }
  }, [token]);

  const fetchLeads = useCallback(
    async (pageToFetch = 1, isLoadMore = false) => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const options = {
          page: pageToFetch,
          limit,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          search: debouncedSearch.trim() || undefined,
        };

        const response = await ApiService.getLeads(token, options);
        const text = await response.text();

        let data = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse leads JSON:', e);
        }

        if (response.ok && data) {
          const newLeads = Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.data?.leads)
            ? data.data.leads
            : Array.isArray(data.leads)
            ? data.leads
            : Array.isArray(data)
            ? data
            : [];

          if (isLoadMore) {
            setLeads((prev) => {
              const seen = new Set(prev.map((l) => l.id || l.trackingId));
              const uniqueNew = newLeads.filter((l) => !seen.has(l.id || l.trackingId));
              return [...prev, ...uniqueNew];
            });
          } else {
            setLeads(newLeads);
          }

          setPage(pageToFetch);
          setHasMore(newLeads.length >= limit);
        } else {
          showToast(data.message || 'Failed to fetch leads data.');
        }
      } catch (error) {
        console.error('Leads Error:', error);
        showToast('Network error while fetching leads.');
      } finally {
        if (isLoadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [token, limit, statusFilter, debouncedSearch, showToast]
  );

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    fetchLeads(page + 1, true);
  }, [loading, loadingMore, hasMore, page, fetchLeads]);

  useEffect(() => {
    fetchLeads(1, false);
    fetchMetrics();
  }, [fetchLeads, fetchMetrics]);

  const resetFilters = useCallback(() => {
    setStatusFilter('ALL');
    setSearchQuery('');
    setDebouncedSearch('');
    setCategoryFilter('ALL');
    setDateRangeFilter('ALL');
    setPage(1);
    setHasMore(true);
  }, []);

  const activeFiltersCount =
    (statusFilter !== 'ALL' ? 1 : 0) +
    (categoryFilter !== 'ALL' ? 1 : 0) +
    (dateRangeFilter !== 'ALL' ? 1 : 0);

  return {
    leads,
    loading,
    loadingMore,
    hasMore,
    page,
    loadMore,
    metrics,
    statusFilter,
    setStatusFilter: (s) => {
      setStatusFilter(s);
      setPage(1);
      setHasMore(true);
    },
    searchQuery,
    setSearchQuery: handleSetSearch,
    categoryFilter,
    setCategoryFilter: (c) => {
      setCategoryFilter(c);
      setPage(1);
    },
    dateRangeFilter,
    setDateRangeFilter: (d) => {
      setDateRangeFilter(d);
      setPage(1);
    },
    activeFiltersCount,
    resetFilters,
    setPage,
    refresh: () => {
      fetchLeads(1, false);
      fetchMetrics();
    },
  };
}
