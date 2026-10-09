import { useEffect, useState, useCallback, useRef } from 'react';
import { ApiService } from '../network/ApiService';
import { useApp } from '../store';

export const APPLICATION_STATUS_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'DISBURSED', label: 'Disbursed' },
  { key: 'REJECTED', label: 'Rejected' },
];

export function useCustomersViewModel() {
  const { showToast, token } = useApp();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Debounced search query
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
      const res = await ApiService.getApplicationMetrics(token);
      if (res.ok) {
        const json = await res.json();
        setMetrics(json.data || json);
      }
    } catch {
      // Metrics are non-blocking enhancement
    }
  }, [token]);

  const fetchApplications = useCallback(
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

        const response = await ApiService.getApplications(token, options);
        const text = await response.text();

        let data = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse applications JSON:', e);
        }

        if (response.ok && data) {
          const apps = Array.isArray(data.data?.applications)
            ? data.data.applications
            : Array.isArray(data.applications)
            ? data.applications
            : Array.isArray(data.data)
            ? data.data
            : Array.isArray(data)
            ? data
            : [];

          if (isLoadMore) {
            setApplications((prev) => {
              const seen = new Set(prev.map((a) => a.id || a.trackingId));
              const uniqueNew = apps.filter((a) => !seen.has(a.id || a.trackingId));
              return [...prev, ...uniqueNew];
            });
          } else {
            setApplications(apps);
          }

          setPage(pageToFetch);
          setHasMore(apps.length >= limit);
        } else {
          showToast(data.message || 'Failed to fetch applications.');
        }
      } catch (error) {
        console.error('Applications Error:', error);
        showToast('Network error while fetching applications.');
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
    fetchApplications(page + 1, true);
  }, [loading, loadingMore, hasMore, page, fetchApplications]);

  useEffect(() => {
    fetchApplications(1, false);
    fetchMetrics();
  }, [fetchApplications, fetchMetrics]);

  const resetFilters = useCallback(() => {
    setStatusFilter('ALL');
    setSearchQuery('');
    setDebouncedSearch('');
    setCategoryFilter('ALL');
    setDateRangeFilter('ALL');
    setSortBy('NEWEST');
    setPage(1);
    setHasMore(true);
  }, []);

  const activeFiltersCount =
    (statusFilter !== 'ALL' ? 1 : 0) +
    (categoryFilter !== 'ALL' ? 1 : 0) +
    (dateRangeFilter !== 'ALL' ? 1 : 0) +
    (sortBy !== 'NEWEST' ? 1 : 0);

  return {
    applications,
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
    setDateRangeFilter,
    sortBy,
    setSortBy,
    activeFiltersCount,
    resetFilters,
    setPage,
    refresh: () => {
      fetchApplications(1, false);
      fetchMetrics();
    },
  };
}
