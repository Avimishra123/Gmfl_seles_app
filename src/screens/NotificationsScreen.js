import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Shimmer } from '../components/ui';
import { ApiService } from '../network/ApiService';
import { useApp } from '../store';
import { colors, type } from '../theme';
import {
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LeadsIcon,
  FileTextIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CheckIcon,
} from '../components/Icons';

function formatNotificationTime(createdAt) {
  if (!createdAt) return '';
  let d;
  if (typeof createdAt === 'object' && createdAt._seconds) {
    d = new Date(createdAt._seconds * 1000);
  } else if (typeof createdAt === 'number') {
    d = new Date(createdAt > 1e11 ? createdAt : createdAt * 1000);
  } else {
    d = new Date(createdAt);
  }
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getTypeConfig(type) {
  const t = String(type || '').toUpperCase();
  if (t.includes('LEAD')) {
    return {
      icon: <LeadsIcon color="#0284C7" />,
      bg: '#E0F2FE',
      borderColor: '#BAE6FD',
      badgeBg: '#E0F2FE',
      badgeFg: '#0369A1',
      badgeText: 'Lead',
    };
  }
  if (t.includes('DISBURSE') || t.includes('CONVERT') || t.includes('APPROV')) {
    return {
      icon: <CheckCircleIcon color="#059669" size={20} />,
      bg: '#DCFCE7',
      borderColor: '#86EFAC',
      badgeBg: '#DCFCE7',
      badgeFg: '#047857',
      badgeText: 'Approved',
    };
  }
  if (t.includes('REJECT') || t.includes('DROP')) {
    return {
      icon: <AlertCircleIcon color="#DC2626" size={20} />,
      bg: '#FEE2E2',
      borderColor: '#FCA5A5',
      badgeBg: '#FEE2E2',
      badgeFg: '#B91C1C',
      badgeText: 'Alert',
    };
  }
  if (t.includes('DOC') || t.includes('APPLICATION')) {
    return {
      icon: <FileTextIcon color="#D97706" size={20} />,
      bg: '#FEF3C7',
      borderColor: '#FDE68A',
      badgeBg: '#FEF3C7',
      badgeFg: '#B45309',
      badgeText: 'Application',
    };
  }
  return {
    icon: <BellIcon color="#475569" size={20} />,
    bg: '#F1F5F9',
    borderColor: '#E2E8F0',
    badgeBg: '#F1F5F9',
    badgeFg: '#475569',
    badgeText: 'Notice',
  };
}

function NotificationSkeletonList() {
  return (
    <View style={styles.listContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <Shimmer style={styles.skeletonIcon} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonRow}>
              <Shimmer style={{ width: 60, height: 16, borderRadius: 6 }} />
              <Shimmer style={{ width: 50, height: 12, borderRadius: 4 }} />
            </View>
            <Shimmer style={{ width: '75%', height: 16, borderRadius: 6, marginVertical: 6 }} />
            <Shimmer style={{ width: '95%', height: 12, borderRadius: 4, marginBottom: 4 }} />
            <Shimmer style={{ width: '60%', height: 12, borderRadius: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function NotificationsScreen({ navigation }) {
  const { token, showToast } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UNREAD'
  const [markingAll, setMarkingAll] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchNotifications = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const res = await ApiService.getNotifications(token, 1, 50);
      if (res.ok) {
        const data = await res.json();
        const list = data.data?.notifications || data.data?.data || [];
        setNotifications(list);
      } else {
        showToast('Could not load notifications');
      }
    } catch (err) {
      console.warn('Notifications fetch err:', err);
      showToast('Network error while loading notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
  };

  const markAsRead = async (id) => {
    if (!id) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id || n._id === id ? { ...n, isRead: true } : n))
    );
    try {
      await ApiService.markNotificationRead(token, id);
    } catch (err) {
      console.warn('markAsRead error:', err);
    }
  };

  const markAllAsRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      const res = await ApiService.markAllNotificationsRead(token);
      if (res.ok) {
        showToast('All notifications marked as read');
      }
    } catch (err) {
      showToast('Could not mark notifications as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationPress = (item) => {
    if (!item.isRead) {
      markAsRead(item.id || item._id);
    }
    const payload = item.dataPayload;
    if (payload?.leadId) {
      navigation.navigate('Customer', {
        id: payload.leadId,
        isApp: Boolean(payload.applicationId),
      });
    } else if (payload?.applicationId) {
      navigation.navigate('Customer', {
        id: payload.applicationId,
        isApp: true,
      });
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredList =
    activeTab === 'UNREAD' ? notifications.filter((n) => !n.isRead) : notifications;

  const renderItem = ({ item }) => {
    const isUnread = !item.isRead;
    const typeConfig = getTypeConfig(item.type);
    const timeFormatted = formatNotificationTime(item.createdAt);
    const trackingId = item.dataPayload?.trackingId;
    const hasDestination = Boolean(item.dataPayload?.leadId || item.dataPayload?.applicationId);

    return (
      <Pressable
        onPress={() => handleNotificationPress(item)}
        style={({ pressed }) => [
          styles.card,
          isUnread ? styles.unreadCard : styles.readCard,
          pressed && styles.cardPressed,
        ]}
      >
        {/* Left Icon Badge */}
        <View style={[styles.iconBox, { backgroundColor: typeConfig.bg }]}>
          {typeConfig.icon}
        </View>

        {/* Content Body */}
        <View style={styles.cardContent}>
          {/* Header Row: Type Badge + Time + Unread indicator */}
          <View style={styles.cardMetaRow}>
            <View style={styles.metaLeft}>
              <View style={[styles.typeBadge, { backgroundColor: typeConfig.badgeBg }]}>
                <Text style={[styles.typeBadgeText, { color: typeConfig.badgeFg }]}>
                  {typeConfig.badgeText}
                </Text>
              </View>
              {trackingId ? (
                <View style={styles.trackingBadge}>
                  <Text style={styles.trackingText} numberOfLines={1}>
                    {trackingId}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={styles.metaRight}>
              {timeFormatted ? <Text style={styles.timeText}>{timeFormatted}</Text> : null}
              {isUnread && <View style={styles.unreadDot} />}
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.cardTitle, isUnread && styles.unreadTitle]} numberOfLines={2}>
            {item.title || 'Notification'}
          </Text>

          {/* Body Message */}
          <Text style={styles.cardBody} numberOfLines={3}>
            {item.body || item.message || ''}
          </Text>

          {/* Bottom Actions Row */}
          <View style={styles.bottomActionRow}>
            {hasDestination ? (
              <View style={styles.linkAction}>
                <Text style={styles.linkText}>View Details</Text>
                <ChevronRightIcon size={14} color={colors.teal} strokeWidth={2.5} />
              </View>
            ) : <View />}

            {isUnread && (
              <Pressable
                hitSlop={8}
                style={styles.markReadBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  markAsRead(item.id || item._id);
                }}
              >
                <CheckIcon size={12} color="#0284C7" strokeWidth={2.5} />
                <Text style={styles.markReadBtnText}>Mark read</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Pressable
          hitSlop={10}
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressedOpacity]}
        >
          <ChevronLeftIcon size={20} color={colors.navy} strokeWidth={2.5} />
        </Pressable>

        <View style={styles.titleWrap}>
          <Text style={styles.screenTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadCountPill}>
              <Text style={styles.unreadCountText}>{unreadCount} new</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 ? (
          <Pressable
            hitSlop={8}
            onPress={markAllAsRead}
            disabled={markingAll}
            style={({ pressed }) => [styles.markAllBtn, pressed && styles.pressedOpacity]}
          >
            {markingAll ? (
              <ActivityIndicator size="small" color={colors.teal} />
            ) : (
              <>
                <CheckIcon size={13} color={colors.teal} strokeWidth={2.5} />
                <Text style={styles.markAllText}>Read all</Text>
              </>
            )}
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Tabs: All / Unread */}
      <View style={styles.tabContainer}>
        <Pressable
          onPress={() => setActiveTab('ALL')}
          style={[styles.tabButton, activeTab === 'ALL' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>
            All ({notifications.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('UNREAD')}
          style={[styles.tabButton, activeTab === 'UNREAD' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeTab === 'UNREAD' && styles.tabTextActive]}>
            Unread ({unreadCount})
          </Text>
        </Pressable>
      </View>

      {/* List or Loading or Empty State */}
      {loading && !refreshing ? (
        <NotificationSkeletonList />
      ) : filteredList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <BellIcon size={38} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>
            {activeTab === 'UNREAD' ? 'No Unread Notifications' : 'All Caught Up!'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'UNREAD'
              ? 'You have reviewed all your assigned leads and updates.'
              : 'You do not have any notifications yet. New lead assignments will appear here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => String(item.id || item._id)}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: Math.max(insets.bottom, 40) + 20 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.teal]}
              tintColor={colors.teal}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressedOpacity: {
    opacity: 0.7,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  screenTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: colors.navy,
  },
  unreadCountPill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  unreadCountText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: '#0284C7',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
  },
  markAllText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: colors.teal,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EDF2F7',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tabText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  tabTextActive: {
    fontFamily: 'DMSans-Bold',
    color: colors.navy,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  readCard: {
    backgroundColor: colors.white,
    borderColor: '#E2E8F0',
  },
  unreadCard: {
    backgroundColor: '#F6FAFD',
    borderColor: '#BAE6FD',
    shadowColor: '#0284C7',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  trackingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    maxWidth: 130,
  },
  trackingText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    color: '#475569',
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: '#94A3B8',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0284C7',
  },
  cardTitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14.5,
    color: colors.navy,
    marginBottom: 3,
  },
  unreadTitle: {
    fontFamily: 'DMSans-Bold',
    color: '#0B192C',
  },
  cardBody: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  bottomActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  linkAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  linkText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.teal,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E0F2FE',
  },
  markReadBtnText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: '#0284C7',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 17,
    color: colors.navy,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
  },
  skeletonCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
  },
  skeletonContent: {
    flex: 1,
    justifyContent: 'center',
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});
