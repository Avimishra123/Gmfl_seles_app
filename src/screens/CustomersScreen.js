import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip, Input, PersonRow, Screen, ListShimmer } from '../components/ui';
import { FilterChipBar } from '../components/FilterChipBar';
import { FilterSheetModal } from '../components/FilterSheetModal';
import { FilterIcon } from '../components/Icons';
import { useCustomersViewModel, APPLICATION_STATUS_FILTERS } from '../viewmodels/CustomersViewModel';
import { colors, DATE_RANGE_OPTIONS, getApplicationMeta, matchesDateRange, type } from '../theme';

export default function CustomersScreen({ navigation }) {
  const {
    applications,
    loading,
    loadingMore,
    loadMore,
    refresh,
    metrics,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    dateRangeFilter,
    setDateRangeFilter,
    sortBy,
    setSortBy,
    activeFiltersCount,
    resetFilters,
  } = useCustomersViewModel();

  const [sheetVisible, setSheetVisible] = useState(false);

  // Dynamic status options with live badge counts from metrics (or local fallback)
  const statusOptions = useMemo(() => {
    return APPLICATION_STATUS_FILTERS.map((f) => {
      let count = null;
      if (metrics) {
        if (f.key === 'ALL') {
          count = metrics.totalAssigned ?? 0;
        } else if (f.key === 'UNDER_REVIEW') {
          count = (metrics.underReview || 0) + (metrics.documentsUploaded || 0) + (metrics.submitted || 0);
        } else if (f.key === 'DOCUMENTS_VERIFIED') {
          count = metrics.documentsVerified ?? 0;
        } else if (f.key === 'APPROVED') {
          count = metrics.approved ?? 0;
        } else if (f.key === 'DISBURSED') {
          count = (metrics.disbursed || 0) + (metrics.completed || 0);
        } else if (f.key === 'REJECTED') {
          count = metrics.rejected ?? 0;
        }
      } else if (Array.isArray(applications)) {
        if (f.key === 'ALL') {
          count = applications.length;
        } else {
          count = applications.filter((app) => {
            const st = (app.status || '').toUpperCase();
            if (f.key === 'UNDER_REVIEW') {
              return ['UNDER_REVIEW', 'DOCUMENTS_UPLOADED', 'SUBMITTED'].includes(st);
            }
            if (f.key === 'DISBURSED') {
              return ['DISBURSED', 'COMPLETED'].includes(st);
            }
            return st === f.key;
          }).length;
        }
      }
      return {
        ...f,
        count,
      };
    });
  }, [metrics, applications]);

  // Dynamically extract loan category options from current data
  const categoryOptions = useMemo(() => {
    const defaults = ['Personal Loans', 'Home Loans', 'Business Loans', 'Vehicle Loans'];
    const dynamic = new Set(defaults);
    if (Array.isArray(applications)) {
      applications.forEach((app) => {
        const name = app.serviceSnapshot?.categoryName || app.categoryName;
        if (name && !name.toLowerCase().includes('insurance') && !name.toLowerCase().includes('mutual')) {
          dynamic.add(name);
        }
      });
    }
    const list = [{ key: 'ALL', label: 'All Loan Products' }];
    Array.from(dynamic).forEach((name) => {
      list.push({ key: name, label: name });
    });
    return list;
  }, [applications]);

  // Filtered and sorted application list
  const list = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const rawList = Array.isArray(applications) ? applications : [];

    let filtered = rawList.filter((app) => {
      // Exclude leads (insurance/mutual) from Customers screen
      const categoryStr = (
        app.serviceSnapshot?.categoryName ||
        app.line ||
        app.serviceType ||
        ''
      ).toLowerCase();
      if (categoryStr.includes('insurance') || categoryStr.includes('mutual')) return false;

      // Category filter
      if (categoryFilter !== 'ALL') {
        if (!categoryStr.includes(categoryFilter.toLowerCase())) return false;
      }

      // Date range filter
      if (dateRangeFilter !== 'ALL') {
        if (!matchesDateRange(app.createdAt || app.updatedAt, dateRangeFilter)) return false;
      }

      // Local search matching
      if (q) {
        const name = app.userSnapshot?.fullName || app.user?.fullName || app.applicantDetails?.fullName || app.name || '';
        const mobile = app.userSnapshot?.phoneNumber || app.user?.phoneNumber || app.applicantDetails?.phoneNumber || app.mobile || '';
        const product = app.serviceSnapshot?.name || app.serviceName || app.product || '';
        const email = app.userSnapshot?.email || app.user?.email || app.email || '';
        const idStr = app.trackingId || '';
        const match = [name, mobile, product, email, idStr].join(' ').toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });

    // Sort by createdAt / updatedAt
    return [...filtered].sort((a, b) => {
      const tA = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const tB = new Date(b.createdAt || b.updatedAt || 0).getTime();
      if (sortBy === 'OLDEST') return tA - tB;
      return tB - tA;
    });
  }, [applications, searchQuery, categoryFilter, dateRangeFilter, sortBy]);

  const hasSecondaryFilters = categoryFilter !== 'ALL' || dateRangeFilter !== 'ALL' || sortBy !== 'NEWEST';

  return (
    <Screen
      tab
      onRefresh={refresh}
      refreshing={loading}
      onEndReached={loadMore}
    >
      <Text style={type.h1}>Customers</Text>
      <Text style={[type.muted, styles.subtitle]}>Assigned customers and their loan applications.</Text>

      {/* Search Input + Filter Sheet Trigger */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search name, mobile, or ID"
            style={styles.searchInput}
          />
        </View>
        <Pressable
          onPress={() => setSheetVisible(true)}
          style={({ pressed }) => [
            styles.filterBtn,
            activeFiltersCount > 0 && styles.filterBtnActive,
            pressed && styles.pressedOpacity,
          ]}
        >
          <FilterIcon
            color={activeFiltersCount > 0 ? '#0284C7' : '#64748B'}
            size={20}
          />
          {activeFiltersCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {/* Status Filter Chip Bar */}
      <FilterChipBar
        options={statusOptions}
        selectedKey={statusFilter}
        onSelect={setStatusFilter}
        containerStyle={styles.chipBarContainer}
      />

      {/* Active Secondary Filters Bar */}
      {hasSecondaryFilters ? (
        <View style={styles.activeFiltersRow}>
          {categoryFilter !== 'ALL' ? (
            <Pressable style={styles.activeTag} onPress={() => setCategoryFilter('ALL')}>
              <Text style={styles.activeTagText}>{categoryFilter} ✕</Text>
            </Pressable>
          ) : null}
          {dateRangeFilter !== 'ALL' ? (
            <Pressable style={styles.activeTag} onPress={() => setDateRangeFilter('ALL')}>
              <Text style={styles.activeTagText}>
                {dateRangeFilter === 'TODAY' ? 'Today' : dateRangeFilter === 'WEEK' ? 'Last 7 Days' : 'This Month'} ✕
              </Text>
            </Pressable>
          ) : null}
          {sortBy !== 'NEWEST' ? (
            <Pressable style={styles.activeTag} onPress={() => setSortBy('NEWEST')}>
              <Text style={styles.activeTagText}>Oldest First ✕</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={resetFilters} hitSlop={6} style={styles.clearBtn}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </Pressable>
        </View>
      ) : null}

      {/* List State & Rows */}
      {loading ? (
        <ListShimmer />
      ) : list.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No applications found</Text>
          <Text style={styles.emptySubtitle}>
            {activeFiltersCount > 0 || statusFilter !== 'ALL' || searchQuery.trim()
              ? 'No applications match your active filters or search keywords.'
              : 'No assigned customer loan applications available.'}
          </Text>
          {activeFiltersCount > 0 || statusFilter !== 'ALL' || searchQuery.trim() ? (
            <Pressable onPress={resetFilters} style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>Reset All Filters</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {list.map((customer) => {
        const id = customer.trackingId || customer.id;
        const name =
          customer.userSnapshot?.fullName ||
          customer.user?.fullName ||
          customer.applicantDetails?.fullName ||
          customer.name ||
          'Unknown';
        const bankName =
          customer.serviceSnapshot?.bankName ||
          customer.serviceSnapshot?.bank ||
          customer.service?.bankName ||
          customer.service?.bank ||
          customer.bankName ||
          customer.bank ||
          customer.partnerBank ||
          customer.partner ||
          customer.provider ||
          customer.institution ||
          customer.applicantDetails?.bankName ||
          customer.applicantDetails?.bank ||
          '';
        const categoryName =
          customer.serviceSnapshot?.categoryName ||
          customer.categoryName ||
          customer.category ||
          customer.serviceType ||
          '';
        const serviceName =
          customer.serviceSnapshot?.name ||
          customer.serviceName ||
          customer.product ||
          '';
        const status = customer.statusLabel || customer.status || '';
        const displayStatus = status.replace(/_/g, ' ');
        const meta = getApplicationMeta(bankName, categoryName, serviceName);

        return (
          <PersonRow
            key={id}
            letter={name[0] ? name[0].toUpperCase() : 'C'}
            name={name}
            meta={meta}
            iconBg={colors.tealSoft}
            iconFg={colors.tealDeep}
            chip={displayStatus ? <Chip label={displayStatus} /> : null}
            onPress={() => navigation.navigate('Customer', { id: customer.id || id, isApp: true })}
          />
        );
      })}

      {/* Infinite Scroll Bottom Spinner */}
      {loadingMore ? (
        <View style={styles.loadingMoreWrap}>
          <ActivityIndicator size="small" color={colors.teal} />
          <Text style={styles.loadingMoreText}>Loading more applications...</Text>
        </View>
      ) : null}

      {/* Filter Bottom Sheet Modal */}
      <FilterSheetModal
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="Filter Applications"
        categoryOptions={categoryOptions}
        selectedCategory={categoryFilter}
        onSelectCategory={setCategoryFilter}
        dateRangeOptions={DATE_RANGE_OPTIONS}
        selectedDateRange={dateRangeFilter}
        onSelectDateRange={setDateRangeFilter}
        selectedSort={sortBy}
        onSelectSort={setSortBy}
        onResetAll={resetFilters}
        onApply={() => setSheetVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: 4,
  },
  chipBarContainer: {
    marginTop: 2,
    marginBottom: 8,
  },
  pressedOpacity: {
    opacity: 0.82,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  searchWrap: {
    flex: 1,
  },
  searchInput: {
    borderRadius: 14,
    height: 48,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#0284C7',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: 'DMSans-Bold',
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingVertical: 4,
  },
  activeTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  activeTagText: {
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
    color: '#0369A1',
  },
  clearBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  clearAllText: {
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
    color: '#EF4444',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 20,
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: colors.navy,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  resetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  resetBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#0284C7',
  },
  loadingMoreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  loadingMoreText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: colors.muted,
  },
});
