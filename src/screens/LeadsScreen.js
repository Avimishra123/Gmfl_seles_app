import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip, Input, PersonRow, Screen, ListShimmer } from '../components/ui';
import { FilterChipBar } from '../components/FilterChipBar';
import { FilterSheetModal } from '../components/FilterSheetModal';
import { FilterIcon } from '../components/Icons';
import { useLeadsViewModel, LEAD_STATUS_FILTERS } from '../viewmodels/LeadsViewModel';
import { colors, DATE_RANGE_OPTIONS, getLeadMeta, matchesDateRange, type } from '../theme';

const LEAD_CATEGORY_OPTIONS = [
  { key: 'ALL', label: 'All Products' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'mutual', label: 'Mutual Funds' },
];

export default function LeadsScreen({ navigation }) {
  const {
    leads,
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
    activeFiltersCount,
    resetFilters,
  } = useLeadsViewModel();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sortBy, setSortBy] = useState('NEWEST');

  // Dynamic status options with live badge counts from metrics (or local fallback)
  const statusOptions = useMemo(() => {
    return LEAD_STATUS_FILTERS.map((f) => {
      let count = null;
      if (metrics) {
        if (f.key === 'ALL') {
          count = metrics.totalAssigned ?? 0;
        } else if (f.key === 'NEW') {
          count = metrics.new ?? metrics.newLeads ?? 0;
        } else if (f.key === 'CONTACTED') {
          count = metrics.contacted ?? 0;
        } else if (f.key === 'FOLLOW_UP') {
          count = metrics.followUp ?? 0;
        } else if (f.key === 'CONVERTED') {
          count = metrics.converted ?? 0;
        } else if (f.key === 'DROPPED') {
          count = metrics.dropped ?? 0;
        }
      } else {
        const listData = Array.isArray(leads) ? leads : (leads?.leads || leads?.docs || leads?.items || []);
        if (f.key === 'ALL') {
          count = listData.length;
        } else {
          count = listData.filter((l) => (l.status || '').toUpperCase() === f.key).length;
        }
      }
      return {
        ...f,
        count,
      };
    });
  }, [metrics, leads]);

  // Filtered and sorted leads list
  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const listData = Array.isArray(leads) ? leads : (leads?.leads || leads?.docs || leads?.items || []);

    let filtered = listData.filter((customer) => {
      const category = (customer.serviceSnapshot?.categoryName || customer.serviceType || customer.line || '').toLowerCase();
      const product = (customer.serviceSnapshot?.name || customer.serviceName || customer.product || '').toLowerCase();

      // Category filter
      if (categoryFilter !== 'ALL') {
        const cat = categoryFilter.toLowerCase();
        if (!category.includes(cat) && !product.includes(cat)) return false;
      }

      // Date range filter
      if (dateRangeFilter !== 'ALL') {
        const rawDate = customer.createdAt || customer.updatedAt || customer.date;
        if (!matchesDateRange(rawDate, dateRangeFilter)) return false;
      }

      // Local search query matching
      if (q) {
        const searchTerms = [
          customer.contactDetails?.fullName,
          customer.userSnapshot?.fullName,
          customer.applicantName,
          customer.name,
          customer.serviceName,
          customer.product,
          customer.serviceSnapshot?.bankName,
          customer.bankName,
          customer.bank,
          customer.trackingId,
          customer.app,
          customer.statusLabel,
          customer.status,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchTerms.includes(q)) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      const tA = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const tB = new Date(b.createdAt || b.updatedAt || 0).getTime();
      if (sortBy === 'OLDEST') return tA - tB;
      return tB - tA;
    });
  }, [leads, searchQuery, categoryFilter, dateRangeFilter, sortBy]);

  const hasSecondaryFilters = categoryFilter !== 'ALL' || dateRangeFilter !== 'ALL' || sortBy !== 'NEWEST';

  return (
    <Screen
      tab
      onRefresh={refresh}
      refreshing={loading}
      onEndReached={loadMore}
    >
      <Text style={type.h1}>Leads</Text>
      <Text style={[type.muted, styles.subtitle]}>Insurance and mutual fund leads assigned to you.</Text>

      {/* Search Input + Filter Sheet Trigger */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search name, product, or ID"
            style={styles.searchInput}
          />
        </View>
        <Pressable
          onPress={() => setSheetVisible(true)}
          style={({ pressed }) => [
            styles.filterBtn,
            (activeFiltersCount > 0 || sortBy !== 'NEWEST') && styles.filterBtnActive,
            pressed && styles.pressedOpacity,
          ]}
        >
          <FilterIcon
            color={(activeFiltersCount > 0 || sortBy !== 'NEWEST') ? '#0284C7' : '#64748B'}
            size={20}
          />
          {activeFiltersCount > 0 || sortBy !== 'NEWEST' ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {activeFiltersCount + (sortBy !== 'NEWEST' ? 1 : 0)}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {/* Horizontal Status Filter Chip Bar */}
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
              <Text style={styles.activeTagText}>
                {categoryFilter === 'insurance' ? 'Insurance' : 'Mutual Funds'} ✕
              </Text>
            </Pressable>
          ) : null}
          {dateRangeFilter !== 'ALL' ? (
            <Pressable style={styles.activeTag} onPress={() => setDateRangeFilter('ALL')}>
              <Text style={styles.activeTagText}>
                {dateRangeFilter === 'TODAY'
                  ? 'Today'
                  : dateRangeFilter === 'WEEK'
                  ? 'Last 7 Days'
                  : 'This Month'} ✕
              </Text>
            </Pressable>
          ) : null}
          {sortBy !== 'NEWEST' ? (
            <Pressable style={styles.activeTag} onPress={() => setSortBy('NEWEST')}>
              <Text style={styles.activeTagText}>Oldest First ✕</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => {
              resetFilters();
              setSortBy('NEWEST');
            }}
            hitSlop={6}
            style={styles.clearBtn}
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </Pressable>
        </View>
      ) : null}

      {/* List State & Rows */}
      {loading ? (
        <ListShimmer />
      ) : filteredLeads.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No leads found</Text>
          <Text style={styles.emptySubtitle}>
            {activeFiltersCount > 0 || statusFilter !== 'ALL' || searchQuery.trim() || sortBy !== 'NEWEST'
              ? 'No leads match your active filters or search keywords.'
              : 'No leads assigned in this category.'}
          </Text>
          {activeFiltersCount > 0 || statusFilter !== 'ALL' || searchQuery.trim() || sortBy !== 'NEWEST' ? (
            <Pressable
              onPress={() => {
                resetFilters();
                setSortBy('NEWEST');
              }}
              style={styles.resetBtn}
            >
              <Text style={styles.resetBtnText}>Reset All Filters</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {filteredLeads.map((customer) => {
        const name =
          customer.contactDetails?.fullName ||
          customer.userSnapshot?.fullName ||
          customer.applicantName ||
          customer.name ||
          'Unknown';
        const id = customer.trackingId || customer.id;
        const serviceName =
          customer.serviceSnapshot?.name ||
          customer.serviceName ||
          customer.product ||
          'Service';
        const serviceType =
          customer.serviceSnapshot?.categoryName ||
          customer.categoryName ||
          customer.serviceType ||
          (customer.line ? customer.line.charAt(0).toUpperCase() + customer.line.slice(1) : '');
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
          '';
        const status = customer.statusLabel || customer.status || '';
        const displayStatus = status.replace(/_/g, ' ');
        const meta = getLeadMeta(bankName, serviceType, serviceName);
        const isMutual = (serviceType || '').toLowerCase().includes('mutual');

        return (
          <PersonRow
            key={id}
            letter={name[0] ? name[0].toUpperCase() : 'U'}
            name={name}
            meta={meta}
            iconBg={isMutual ? colors.indigoSoft : colors.tealSoft}
            iconFg={isMutual ? colors.indigo : colors.tealDeep}
            chip={displayStatus ? <Chip label={displayStatus} /> : null}
            onPress={() => navigation.navigate('Customer', { id: customer.id || id })}
          />
        );
      })}

      {/* Infinite Scroll Bottom Spinner */}
      {loadingMore ? (
        <View style={styles.loadingMoreWrap}>
          <ActivityIndicator size="small" color={colors.teal} />
          <Text style={styles.loadingMoreText}>Loading more leads...</Text>
        </View>
      ) : null}

      {/* Filter Bottom Sheet Modal */}
      <FilterSheetModal
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="Filter Leads"
        categoryOptions={LEAD_CATEGORY_OPTIONS}
        selectedCategory={categoryFilter}
        onSelectCategory={setCategoryFilter}
        dateRangeOptions={DATE_RANGE_OPTIONS}
        selectedDateRange={dateRangeFilter}
        onSelectDateRange={setDateRangeFilter}
        selectedSort={sortBy}
        onSelectSort={setSortBy}
        onResetAll={() => {
          resetFilters();
          setSortBy('NEWEST');
        }}
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
