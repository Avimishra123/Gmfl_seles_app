import { StyleSheet, View } from 'react-native';
import { Screen, Shimmer } from './ui';
import { colors } from '../theme';

export function ApplicationDetailSkeleton() {
  return (
    <Screen>
      {/* Header skeleton */}
      <View style={styles.header}>
        <Shimmer style={styles.backBtn} />
        <View style={styles.flexOne}>
          <Shimmer style={styles.headerTitle} />
          <Shimmer style={styles.headerSub} />
        </View>
      </View>

      {/* Stepper Card skeleton */}
      <View style={styles.card}>
        <View style={styles.stepsRow}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.stepItem}>
              <Shimmer style={styles.stepNode} />
              <Shimmer style={styles.stepLabel} />
            </View>
          ))}
        </View>
      </View>

      {/* Customer Info Card skeleton */}
      <View style={styles.card}>
        <View style={styles.customerHeader}>
          <Shimmer style={styles.avatar} />
          <View style={styles.flexOne}>
            <Shimmer style={styles.applicantName} />
            <Shimmer style={styles.productSub} />
          </View>
          <Shimmer style={styles.chip} />
        </View>

        <View style={styles.divider} />

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Shimmer style={styles.infoLabel} />
            <Shimmer style={styles.infoValue1} />
          </View>
          <View style={styles.infoRow}>
            <Shimmer style={styles.infoLabel} />
            <Shimmer style={styles.infoValue2} />
          </View>
          <View style={styles.infoRow}>
            <Shimmer style={styles.infoLabel} />
            <Shimmer style={styles.infoValue3} />
          </View>
          <View style={styles.infoRow}>
            <Shimmer style={styles.infoLabel} />
            <Shimmer style={styles.infoValue4} />
          </View>
        </View>
      </View>

      {/* Action Card skeleton */}
      <View style={styles.card}>
        <View style={styles.actionHeader}>
          <Shimmer style={styles.actionAvatar} />
          <View style={styles.flexOne}>
            <Shimmer style={styles.actionTitle} />
            <Shimmer style={styles.actionSub} />
          </View>
          <Shimmer style={styles.chipLarge} />
        </View>

        <View style={styles.actionBtns}>
          <Shimmer style={styles.primaryBtn} />
          <View style={styles.secondaryBtnRow}>
            <Shimmer style={styles.secondaryBtn} />
            <Shimmer style={styles.secondaryBtn} />
          </View>
        </View>
      </View>

      {/* Quick Actions Card skeleton */}
      <View style={styles.quickCard}>
        <View style={styles.quickRow}>
          <Shimmer style={styles.quickIcon} />
          <View style={styles.flexOne}>
            <Shimmer style={styles.quickTitle} />
            <Shimmer style={styles.quickSub} />
          </View>
          <Shimmer style={styles.chevron} />
        </View>
        <View style={styles.quickDivider} />
        <View style={styles.quickRow}>
          <Shimmer style={styles.quickIcon} />
          <View style={styles.flexOne}>
            <Shimmer style={styles.quickTitle} />
            <Shimmer style={styles.quickSub} />
          </View>
          <Shimmer style={styles.chevron} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  headerTitle: {
    width: 140,
    height: 18,
    borderRadius: 6,
  },
  headerSub: {
    width: 220,
    height: 12,
    borderRadius: 4,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 15,
    marginVertical: 5,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  stepNode: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  stepLabel: {
    width: 48,
    height: 10,
    borderRadius: 4,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  applicantName: {
    width: 110,
    height: 15,
    borderRadius: 5,
  },
  productSub: {
    width: 160,
    height: 12,
    borderRadius: 4,
    marginTop: 4,
  },
  chip: {
    width: 58,
    height: 24,
    borderRadius: 999,
  },
  chipLarge: {
    width: 88,
    height: 24,
    borderRadius: 999,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 12,
  },
  infoList: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    width: 60,
    height: 12,
    borderRadius: 4,
  },
  infoValue1: {
    width: 130,
    height: 13,
    borderRadius: 4,
  },
  infoValue2: {
    width: 180,
    height: 13,
    borderRadius: 4,
  },
  infoValue3: {
    width: 90,
    height: 13,
    borderRadius: 4,
  },
  infoValue4: {
    width: 160,
    height: 13,
    borderRadius: 4,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  actionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginTop: 2,
  },
  actionTitle: {
    width: 120,
    height: 15,
    borderRadius: 5,
  },
  actionSub: {
    width: 190,
    height: 12,
    borderRadius: 4,
    marginTop: 4,
  },
  actionBtns: {
    marginTop: 14,
    gap: 8,
  },
  primaryBtn: {
    width: '100%',
    height: 42,
    borderRadius: 12,
  },
  secondaryBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
  },
  quickCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    paddingVertical: 6,
    marginTop: 6,
    marginBottom: 20,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
  },
  quickTitle: {
    width: 130,
    height: 14,
    borderRadius: 4,
  },
  quickSub: {
    width: 180,
    height: 11,
    borderRadius: 4,
    marginTop: 4,
  },
  chevron: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  quickDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 14,
  },
});
