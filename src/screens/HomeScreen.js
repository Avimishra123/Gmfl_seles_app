import Clipboard from '@react-native-clipboard/clipboard';
import LinearGradient from 'react-native-linear-gradient';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Avatar, Btn, Chip, PersonRow, Screen, ListShimmer } from '../components/ui';
import { AGENT, shareMessage } from '../data';
import { useApp } from '../store';
import { useHomeViewModel } from '../viewmodels/HomeViewModel';
import { colors, getApplicationMeta, getLeadMeta, type } from '../theme';

import { BellIcon } from '../components/Icons';

export default function HomeScreen({ navigation }) {
  const { showToast } = useApp();
  const { dashboardData, loading, refresh } = useHomeViewModel();

  const activeApps = dashboardData?.metrics?.activeApplications ?? '42';
  const leadsCount = dashboardData?.metrics?.totalLeads ?? '125';
  const docsPending = dashboardData?.metrics?.docsPending ?? '18';
  const underProcess = dashboardData?.metrics?.underProcess ?? '15';
  const docsToReview = dashboardData?.metrics?.docsToReview ?? '18';
  const completedCount = dashboardData?.metrics?.completed ?? '9';

  const agentName = dashboardData?.agent?.name ?? AGENT.name;
  const agentCode = dashboardData?.agent?.agentCode ?? AGENT.code;
  const initial = agentName ? agentName[0].toUpperCase() : 'A';

  const shareLinkUrl = dashboardData?.referral?.playStoreUrl ?? AGENT.link;
  const shareMessageText = dashboardData?.referral?.shareMessage ?? shareMessage();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  function copyLink() {
    Clipboard.setString(shareLinkUrl);
    showToast('Link copied to clipboard');
  }

  async function shareLink() {
    try {
      await Share.share({ message: shareMessageText, url: shareLinkUrl });
      showToast('Link shared');
    } catch {
      showToast('Share closed');
    }
  }

  const needsActionList = dashboardData?.needsAction || [];

  return (
    <Screen tab onRefresh={refresh} refreshing={loading}>
      {/* Consistent Screen Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerInfo}>
          <Text style={type.h1}>Dashboard</Text>
          <Text style={[type.muted, styles.subtitle]}>
            {greeting}, {agentName} · {agentCode}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Pressable
            onPress={() => navigation.navigate('Notifications')}
            style={({ pressed }) => [styles.avatarPress, pressed && styles.pressedOpacity]}
          >
            <BellIcon color={colors.navy} size={28} />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            style={({ pressed }) => [styles.avatarPress, pressed && styles.pressedOpacity]}
          >
            <Avatar letter={initial} bg={colors.tealSoft} fg={colors.tealDeep} size={46} />
          </Pressable>
        </View>
      </View>

      {/* Branded Executive Pipeline Card */}
      <LinearGradient
        colors={['#0B192C', '#132A4B', '#0055B8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.between}>
          <View>
            <Text style={styles.heroLabel}>Assigned Pipeline</Text>
            <Text style={styles.heroCount}>{loading ? '...' : activeApps}</Text>
            <Text style={styles.heroSub}>Active loan applications</Text>
          </View>
          <Chip label="LIVE" tone={{ bg: 'rgba(255,255,255,0.18)', fg: '#FFFFFF' }} />
        </View>
        <View style={styles.stats}>
          <Pressable
            style={({ pressed }) => [styles.stat, pressed && styles.pressedOpacity]}
            onPress={() => navigation.navigate('Leads')}
          >
            <Text style={styles.statValue}>{loading ? '-' : leadsCount}</Text>
            <Text style={styles.statLabel}>Leads</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.stat, pressed && styles.pressedOpacity]}
            onPress={() => navigation.navigate('Customers')}
          >
            <Text style={styles.statValue}>{loading ? '-' : underProcess}</Text>
            <Text style={styles.statLabel}>In process</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.stat, pressed && styles.pressedOpacity]}
            onPress={() => navigation.navigate('Customers')}
          >
            <Text style={styles.statValue}>{loading ? '-' : docsPending}</Text>
            <Text style={styles.statLabel}>Docs pending</Text>
          </Pressable>
        </View>
      </LinearGradient>

      {/* Actionable KPI Cards */}
      <View style={styles.kpi}>
        <PressCard
          value={loading ? '-' : docsToReview}
          label="Docs to review"
          onPress={() => navigation.navigate('Docs')}
        />
        <PressCard
          value={loading ? '-' : completedCount}
          label="Completed"
          onPress={() => navigation.navigate('Customers')}
        />
      </View>

      {/* Share User App Link Card */}
      <View style={styles.shareCard}>
        <View style={styles.between}>
          <View style={styles.flexOne}>
            <Text style={type.title}>Share user app link</Text>
            <Text style={[type.muted, styles.shareSub]}>Your agent referral link for customer apps</Text>
          </View>
          <Chip label={agentCode} />
        </View>
        <View style={styles.btnRow}>
          <Btn label="Copy Link" variant="ghost" flex onPress={copyLink} />
          <Btn label="Share Link" flex onPress={shareLink} />
        </View>
      </View>

      {/* Recent Activity / Action Items Header */}
      <View style={styles.sectionHeader}>
        <Text style={type.h3}>Recent Activity</Text>
        <Pressable
          onPress={() => navigation.navigate('Customers')}
          style={({ pressed }) => pressed && styles.pressedOpacity}
        >
          <Text style={styles.viewAllText}>View all</Text>
        </Pressable>
      </View>

      {/* Recent Items List or Empty State */}
      {loading ? (
        <ListShimmer />
      ) : needsActionList.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>
            No pending customer applications or leads require immediate action.
          </Text>
        </View>
      ) : (
        needsActionList.map((item) => {
          const isApp = (item.trackingId || '').includes('APP');
          const serviceName = item.serviceName || item.product || 'Service';
          const serviceType = item.serviceType || item.categoryName || '';
          const bankName =
            item.serviceSnapshot?.bankName ||
            item.serviceSnapshot?.bank ||
            item.bankName ||
            item.bank ||
            '';
          const meta = isApp
            ? getApplicationMeta(bankName, serviceType, serviceName)
            : getLeadMeta(bankName, serviceType, serviceName);

          const status = item.statusLabel || item.status || '';
          const displayStatus = status.replace(/_/g, ' ');

          return (
            <PersonRow
              key={item.trackingId || item.id}
              letter={item.applicantName ? item.applicantName[0].toUpperCase() : 'U'}
              name={item.applicantName || 'Unknown Applicant'}
              meta={meta}
              iconBg={isApp ? colors.tealSoft : colors.indigoSoft}
              iconFg={isApp ? colors.tealDeep : colors.indigo}
              chip={displayStatus ? <Chip label={displayStatus} /> : null}
              onPress={() => {
                navigation.navigate('Customer', { id: item.id, isApp });
              }}
            />
          );
        })
      )}
    </Screen>
  );
}

function PressCard({ value, label, onPress }) {
  const body = (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.flexOne, pressed && styles.pressedOpacity]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerInfo: {
    flex: 1,
    paddingRight: 10,
  },
  subtitle: {
    marginTop: 4,
  },
  avatarPress: {
    padding: 2,
  },
  pressedOpacity: {
    opacity: 0.85,
  },
  hero: {
    borderRadius: 20,
    padding: 16,
    shadowColor: colors.navy,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  heroLabel: {
    color: '#94A3B8',
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
  },
  heroCount: {
    color: '#FFFFFF',
    fontFamily: 'Fraunces-Bold',
    fontSize: 28,
    marginVertical: 1,
  },
  heroSub: {
    color: '#CBD5E1',
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statValue: {
    color: '#FFFFFF',
    fontFamily: 'DMSans-ExtraBold',
    fontSize: 17,
  },
  statLabel: {
    color: '#CBD5E1',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 10,
    marginTop: 2,
  },
  kpi: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  kpiCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 12,
  },
  kpiValue: {
    fontFamily: 'Fraunces-Bold',
    fontSize: 22,
    color: colors.navy,
  },
  kpiLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
  },
  shareCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },
  shareSub: {
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  viewAllText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: colors.tealDeep,
  },
  emptyCard: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 2,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: colors.navy,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  flexOne: {
    flex: 1,
  },
});
