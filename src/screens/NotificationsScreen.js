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
import { Shimmer } from '../components/ui';
import { ApiService } from '../network/ApiService';
import { useApp } from '../store';
import { colors } from '../theme';
import {
  BellIcon,
  ChevronLeftIcon,
  CheckIcon,
} from '../components/Icons';
import Svg, { Path, Circle } from 'react-native-svg';

function ClockIcon({ size = 14, color = '#64748B' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 6v6l4 2" />
    </Svg>
  );
}

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

function NotificationSkeletonList() {
  return (
    <View style={styles.listContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <Shimmer style={styles.skeletonIcon} />
          <View style={styles.skeletonContent}>
            <Shimmer style={{ width: '60%', height: 16, borderRadius: 6, marginBottom: 8 }} />
            <Shimmer style={{ width: '95%', height: 12, borderRadius: 4, marginBottom: 4 }} />
            <Shimmer style={{ width: '70%', height: 12, borderRadius: 4, marginBottom: 12 }} />
            <Shimmer style={{ width: '30%', height: 12, borderRadius: 4 }} />
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
  const [activeTab, setActiveTab] = useState('ALL');
  const [markingAll, setMarkingAll] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchNotifications = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const res = await ApiService.getNotifications(token, 1, 50);
      if (res.ok) {
        const data = await res.json();
        let list = data.data?.notifications || data.data?.data || [];
        list.sort((a, b) => {
          const getMs = (dateObj) => {
            if (!dateObj) return 0;
            if (typeof dateObj === 'object' && dateObj._seconds) return dateObj._seconds * 1000;
            if (typeof dateObj === 'number') return dateObj > 1e11 ? dateObj : dateObj * 1000;
            const d = new Date(dateObj);
            return isNaN(d.getTime()) ? 0 : d.getTime();
          };
          return getMs(b.createdAt) - getMs(a.createdAt);
        });
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
    const timeFormatted = formatNotificationTime(item.createdAt);

    return (
      <Pressable
        onPress={() => handleNotificationPress(item)}
        style={({ pressed }) => [
          styles.card,
          isUnread ? styles.unreadCard : styles.readCard,
          pressed && styles.cardPressed,
        ]}
      >
        {isUnread && <View style={styles.unreadDotTopRight} />}
        
        <View style={[styles.iconBox, isUnread ? styles.iconBoxUnread : styles.iconBoxRead]}>
          <BellIcon color={isUnread ? "#D97706" : "#64748B"} size={20} />
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, isUnread && styles.unreadTitle]} numberOfLines={2}>
            {item.title || 'Notification'}
          </Text>

          <Text style={styles.cardBody} numberOfLines={3}>
            {item.body || item.message || ''}
          </Text>

          <View style={styles.timeRow}>
            <ClockIcon size={14} color="#94A3B8" />
            <Text style={styles.timeText}>{timeFormatted}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
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
              <View style={styles.redBadge}>
                <Text style={styles.redBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>

        {unreadCount > 0 ? (
          <Pressable
            hitSlop={8}
            onPress={markAllAsRead}
            disabled={markingAll}
            style={({ pressed }) => [styles.markAllBtn, pressed && styles.pressedOpacity]}
          >
            {markingAll ? (
              <ActivityIndicator size="small" color="#C2410C" />
            ) : (
              <>
                <CheckIcon size={14} color="#C2410C" strokeWidth={3} />
                <Text style={styles.markAllText}>Read all</Text>
              </>
            )}
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <Pressable
          onPress={() => setActiveTab('ALL')}
          style={[styles.tabButton, activeTab === 'ALL' ? styles.tabButtonActive : styles.tabButtonInactive]}
        >
          <Text style={[styles.tabText, activeTab === 'ALL' ? styles.tabTextActive : styles.tabTextInactive]}>
            All
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('UNREAD')}
          style={[styles.tabButton, activeTab === 'UNREAD' ? styles.tabButtonActive : styles.tabButtonInactive]}
        >
          <Text style={[styles.tabText, activeTab === 'UNREAD' ? styles.tabTextActive : styles.tabTextInactive]}>
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
              colors={['#C2410C']}
              tintColor={'#C2410C'}
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
    backgroundColor: '#F9FAFB',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressedOpacity: {
    opacity: 0.7,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  screenTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: '#111827',
  },
  redBadge: {
    backgroundColor: '#DC2626',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redBadgeText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFEDD5',
  },
  markAllText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#C2410C',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    gap: 10,
  },
  tabButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabButtonActive: {
    backgroundColor: '#A33310',
    borderColor: '#A33310',
  },
  tabButtonInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  tabText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: '#6B7280',
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  readCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  unreadCard: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },
  unreadDotTopRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxRead: {
    backgroundColor: '#F3F4F6',
  },
  iconBoxUnread: {
    backgroundColor: '#FFEDD5',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 4,
    paddingRight: 12,
  },
  unreadTitle: {
    color: '#9A3412',
  },
  cardBody: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#6B7280',
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 14,
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  skeletonContent: {
    flex: 1,
    justifyContent: 'center',
  },
});
