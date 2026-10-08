import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip } from './ui';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  CheckIcon,
  PhoneIcon,
  RefreshIcon,
  XIcon,
} from './Icons';
import { colors } from '../theme';

export function LeadActionCard({
  customer,
  onUpdateStatus,
  onOpenDropModal,
  loading = false,
}) {
  const status = String(customer?.status || 'NEW').toUpperCase();

  // 1. CONVERTED (Terminal Success State)
  if (status === 'CONVERTED') {
    return (
      <View style={[styles.card, styles.successCard]}>
        <View style={styles.topRow}>
          <View style={[styles.markCircle, styles.markCircleGreen]}>
            <CheckCircleIcon size={20} color={colors.greenText} />
          </View>
          <View style={styles.flexOne}>
            <Text style={styles.cardTitle}>Lead Converted 🎉</Text>
            <Text style={styles.cardSub}>
              This lead was successfully converted and product policy or service application created.
            </Text>
          </View>
          <Chip label="CONVERTED" tone={{ bg: colors.greenSoft, fg: colors.greenText }} />
        </View>
      </View>
    );
  }

  // 2. DROPPED State with Reactivate Action
  if (status === 'DROPPED') {
    const lastHistory = customer?.statusHistory?.[customer.statusHistory.length - 1];
    const dropReason = customer?.agentRemarks || lastHistory?.remarks || 'Lead dropped by salesperson.';

    return (
      <View style={[styles.card, styles.droppedCard]}>
        <View style={styles.topRow}>
          <View style={[styles.markCircle, styles.markCircleRed]}>
            <AlertCircleIcon size={20} color={colors.red} />
          </View>
          <View style={styles.flexOne}>
            <Text style={[styles.cardTitle, styles.droppedTitle]}>Lead Dropped</Text>
            <Text style={styles.cardSub}>Reason: {dropReason}</Text>
          </View>
          <Chip label="DROPPED" tone={{ bg: colors.redSoft, fg: colors.red }} />
        </View>

        <View style={styles.actionDivider} />

        <View style={styles.actionRowWrap}>
          <Pressable
            onPress={() => onUpdateStatus('CONTACTED', 'Lead reactivated and contacted')}
            disabled={loading}
            style={({ pressed }) => [
              styles.outlineActionBtn,
              pressed && styles.pressedOpacity,
            ]}
          >
            <RefreshIcon size={14} color={colors.navy} />
            <Text style={styles.outlineActionBtnText}>
              {loading ? 'Updating...' : 'Reactivate Lead'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // 3. NEW Lead State
  if (status === 'NEW') {
    return (
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={[styles.markCircle, styles.markCircleBlue]}>
            <PhoneIcon size={18} color="#0284C7" />
          </View>
          <View style={styles.flexOne}>
            <Text style={styles.cardTitle}>New Lead Assigned</Text>
            <Text style={styles.cardSub}>
              Connect with applicant to introduce loan or insurance solutions.
            </Text>
          </View>
          <Chip label="NEW" tone={{ bg: '#E0F2FE', fg: '#0284C7' }} />
        </View>

        <View style={styles.actionDivider} />

        <View style={styles.btnGrid}>
          <Pressable
            onPress={() => onUpdateStatus('CONTACTED', 'First conversation initiated')}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.pressedOpacity,
            ]}
          >
            <PhoneIcon size={14} color={colors.white} />
            <Text style={styles.primaryBtnText}>
              {loading ? 'Saving...' : 'Mark Contacted'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onUpdateStatus('FOLLOW_UP', 'Follow up scheduled')}
            disabled={loading}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && styles.pressedOpacity,
            ]}
          >
            <Text style={styles.secondaryBtnText}>Set Follow Up</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={onOpenDropModal}
          disabled={loading}
          style={({ pressed }) => [styles.dropTextBtn, pressed && styles.pressedOpacity]}
        >
          <XIcon size={13} color={colors.red} />
          <Text style={styles.dropTextBtnLabel}>Drop this lead</Text>
        </Pressable>
      </View>
    );
  }

  // 4. CONTACTED Lead State
  if (status === 'CONTACTED') {
    return (
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={[styles.markCircle, styles.markCircleTeal]}>
            <CheckIcon size={18} color={colors.tealDeep} />
          </View>
          <View style={styles.flexOne}>
            <Text style={styles.cardTitle}>Lead Contacted</Text>
            <Text style={styles.cardSub}>
              Follow up or convert once customer chooses a plan.
            </Text>
          </View>
          <Chip label="CONTACTED" tone={{ bg: colors.tealSoft, fg: colors.tealDeep }} />
        </View>

        <View style={styles.actionDivider} />

        <View style={styles.btnGrid}>
          <Pressable
            onPress={() => onUpdateStatus('CONVERTED', 'Customer agreed and opted into policy/product')}
            disabled={loading}
            style={({ pressed }) => [
              styles.convertBtn,
              pressed && styles.pressedOpacity,
            ]}
          >
            <CheckCircleIcon size={14} color={colors.white} />
            <Text style={styles.primaryBtnText}>
              {loading ? 'Saving...' : 'Convert Lead'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onUpdateStatus('FOLLOW_UP', 'Follow-up discussion scheduled')}
            disabled={loading}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && styles.pressedOpacity,
            ]}
          >
            <Text style={styles.secondaryBtnText}>Schedule Follow Up</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={onOpenDropModal}
          disabled={loading}
          style={({ pressed }) => [styles.dropTextBtn, pressed && styles.pressedOpacity]}
        >
          <XIcon size={13} color={colors.red} />
          <Text style={styles.dropTextBtnLabel}>Drop this lead</Text>
        </Pressable>
      </View>
    );
  }

  // 5. FOLLOW_UP Lead State
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.markCircle, styles.markCircleAmber]}>
          <PhoneIcon size={18} color={colors.amberText} />
        </View>
        <View style={styles.flexOne}>
          <Text style={styles.cardTitle}>Follow-Up Pending</Text>
          <Text style={styles.cardSub}>
            Reach out for scheduled call or customer documents.
          </Text>
        </View>
        <Chip label="FOLLOW UP" tone={{ bg: colors.amberSoft, fg: colors.amberText }} />
      </View>

      <View style={styles.actionDivider} />

      <View style={styles.btnGrid}>
        <Pressable
          onPress={() => onUpdateStatus('CONVERTED', 'Customer converted successfully')}
          disabled={loading}
          style={({ pressed }) => [
            styles.convertBtn,
            pressed && styles.pressedOpacity,
          ]}
        >
          <CheckCircleIcon size={14} color={colors.white} />
          <Text style={styles.primaryBtnText}>
            {loading ? 'Saving...' : 'Convert Lead'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onUpdateStatus('CONTACTED', 'Customer re-contacted and informed')}
          disabled={loading}
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && styles.pressedOpacity,
          ]}
        >
          <Text style={styles.secondaryBtnText}>Log Call</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onOpenDropModal}
        disabled={loading}
        style={({ pressed }) => [styles.dropTextBtn, pressed && styles.pressedOpacity]}
      >
        <XIcon size={13} color={colors.red} />
        <Text style={styles.dropTextBtnLabel}>Drop this lead</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  successCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  droppedCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markCircleGreen: {
    backgroundColor: colors.greenSoft,
  },
  markCircleRed: {
    backgroundColor: colors.redSoft,
  },
  markCircleBlue: {
    backgroundColor: '#E0F2FE',
  },
  markCircleTeal: {
    backgroundColor: colors.tealSoft,
  },
  markCircleAmber: {
    backgroundColor: colors.amberSoft,
  },
  flexOne: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: colors.navy,
  },
  cardSub: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  droppedTitle: {
    color: colors.red,
  },
  actionDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 14,
  },
  btnGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 12,
  },
  convertBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: colors.white,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    borderRadius: 12,
  },
  secondaryBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: colors.navy,
  },
  dropTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingVertical: 4,
  },
  dropTextBtnLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: colors.red,
  },
  actionRowWrap: {
    flexDirection: 'row',
  },
  outlineActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: colors.white,
  },
  outlineActionBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: colors.navy,
  },
  pressedOpacity: {
    opacity: 0.82,
  },
});
