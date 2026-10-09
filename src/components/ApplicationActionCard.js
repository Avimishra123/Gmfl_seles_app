import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip } from './ui';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  FileTextIcon,
  RefreshIcon,
  XIcon,
} from './Icons';
import { colors } from '../theme';

export function ApplicationActionCard({
  customer,
  onReviewDocs,
  onApprove,
  onOpenReject,
  onOpenDisburse,
  onReopenReview,
  loading = false,
}) {
  const status = String(customer?.status || 'DRAFT').toUpperCase();
  const rawDocs = customer?.documents || customer?.docs || [];

  // Check mandatory docs fulfillment
  const requiredDocs = customer?.serviceSnapshot?.requiredDocuments || [];
  const mandatoryDocs = requiredDocs.filter((r) => r.isMandatory !== false);

  const docMap = new Map();
  for (const d of rawDocs) {
    if (d && (d.code || d.name)) {
      docMap.set(String(d.code || d.name).toUpperCase(), d);
    }
  }

  const allMandatoryVerified =
    mandatoryDocs.length > 0
      ? mandatoryDocs.every((req) => {
          const match = docMap.get(String(req.code).toUpperCase());
          return match && (match.status === 'VERIFIED' || match.state === 'approved');
        })
      : rawDocs.length > 0 && rawDocs.every((d) => d.status === 'VERIFIED' || d.state === 'approved');

  const pendingDocsCount = rawDocs.filter(
    (d) => d.status !== 'VERIFIED' && d.state !== 'approved'
  ).length;

  // 1. Terminal Disbursed / Completed
  if (status === 'DISBURSED' || status === 'COMPLETED') {
    return (
      <View style={[styles.card, styles.successCard]}>
        <View style={styles.topRow}>
          <View style={[styles.markCircle, styles.markCircleGreen]}>
            <CheckCircleIcon size={20} color={colors.greenText} />
          </View>
          <View style={styles.flexOne}>
            <Text style={styles.cardTitle}>Application Finalized</Text>
            <Text style={styles.cardSub}>
              All compliance requirements and loan disbursements are recorded.
            </Text>
          </View>
          <Chip label="DISBURSED" tone={{ bg: colors.greenSoft, fg: colors.greenText }} />
        </View>
        <View style={styles.ctaBtnWrap}>
          <Pressable
            onPress={onReviewDocs}
            style={({ pressed }) => [
              styles.outlineActionBtn,
              pressed && styles.pressedOpacity,
            ]}
          >
            <FileTextIcon size={14} color={colors.navy} />
            <Text style={styles.outlineActionBtnText}>
              View Documents
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // 2. Rejected
  if (status === 'REJECTED') {
    const reason = customer?.agentRemarks || 'Application rejected by salesperson.';
    return (
      <View style={[styles.card, styles.rejectedCard]}>
        <View style={styles.topRow}>
          <View style={[styles.markCircle, styles.markCircleRed]}>
            <AlertCircleIcon size={20} color={colors.red} />
          </View>
          <View style={styles.flexOne}>
            <Text style={[styles.cardTitle, styles.rejectedTitle]}>Application Rejected</Text>
            <Text style={styles.cardSub}>Reason: {reason}</Text>
          </View>
          <Chip label="REJECTED" tone={{ bg: colors.redSoft, fg: colors.red }} />
        </View>
        <View style={styles.ctaBtnWrap}>
          <Pressable
            onPress={onReopenReview}
            disabled={loading}
            style={({ pressed }) => [
              styles.outlineActionBtn,
              pressed && styles.pressedOpacity,
            ]}
          >
            <RefreshIcon size={14} color={colors.navy} />
            <Text style={styles.outlineActionBtnText}>
              {loading ? 'Reopening...' : 'Reopen Under Review'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // 3. Approved -> Ready to Disburse
  if (status === 'APPROVED') {
    return (
      <View style={styles.disburseCard}>
        <View style={styles.disburseTopRow}>
          <View style={styles.disburseHeaderLeft}>
            <View style={styles.disburseIconCircle}>
              <CheckCircleIcon size={20} color="#15803D" strokeWidth={2.5} />
            </View>
            <View style={styles.disburseTitleWrap}>
              <Text style={styles.disburseTitle}>Loan Approved</Text>
              <Text style={styles.disburseSub}>Verification Complete</Text>
            </View>
          </View>
          <Chip label="READY TO DISBURSE" tone={{ bg: '#DCFCE7', fg: '#15803D' }} />
        </View>

        <View style={styles.disburseNoticeBox}>
          <Text style={styles.disburseNoticeText}>
            Application passed verification. Record sanctioned terms to disburse funds.
          </Text>
        </View>

        <View style={styles.disburseActionRow}>
          <Pressable
            onPress={onOpenDisburse}
            disabled={loading}
            style={({ pressed }) => [
              styles.disburseHeroBtn,
              pressed && styles.pressedOpacity,
            ]}
          >
            <CheckCircleIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.disburseHeroBtnText}>
              {loading ? 'Disbursing...' : 'Disburse Loan'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onOpenReject}
            disabled={loading}
            style={({ pressed }) => [
              styles.disburseSecondaryRejectBtn,
              pressed && styles.pressedOpacity,
            ]}
          >
            <XIcon size={14} color="#DC2626" strokeWidth={2.2} />
            <Text style={styles.disburseSecondaryRejectText}>Reject</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // 4. All Documents Verified -> Ready for Approval / Decision
  if (status === 'DOCUMENTS_VERIFIED' || allMandatoryVerified) {
    return (
      <View style={styles.disburseCard}>
        <View style={styles.disburseTopRow}>
          <View style={styles.disburseHeaderLeft}>
            <View style={styles.disburseIconCircle}>
              <CheckCircleIcon size={20} color="#15803D" strokeWidth={2.5} />
            </View>
            <View style={styles.disburseTitleWrap}>
              <Text style={styles.disburseTitle}>Documents Verified</Text>
              <Text style={styles.disburseSub}>Ready for Decision</Text>
            </View>
          </View>
          <Chip label="READY TO APPROVE" tone={{ bg: '#DCFCE7', fg: '#15803D' }} />
        </View>

        <View style={styles.disburseNoticeBox}>
          <Text style={styles.disburseNoticeText}>
            Every required document has been verified. You can now approve or reject this application.
          </Text>
        </View>

        <View style={styles.disburseActionRow}>
          <Pressable
            onPress={onApprove}
            disabled={loading}
            style={({ pressed }) => [
              styles.disburseHeroBtn,
              pressed && styles.pressedOpacity,
            ]}
          >
            <CheckIcon size={15} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.disburseHeroBtnText}>
              {loading ? 'Approving...' : 'Approve Application'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onOpenReject}
            disabled={loading}
            style={({ pressed }) => [
              styles.disburseSecondaryRejectBtn,
              pressed && styles.pressedOpacity,
            ]}
          >
            <XIcon size={14} color="#DC2626" strokeWidth={2.2} />
            <Text style={styles.disburseSecondaryRejectText}>Reject</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // 5. In Progress - Documents Pending Verification
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.markCircle, styles.markCircleTeal]}>
          <FileTextIcon size={20} color={colors.tealDeep} />
        </View>
        <View style={styles.flexOne}>
          <Text style={styles.cardTitle}>Document Verification Required</Text>
          <Text style={styles.cardSub}>
            {pendingDocsCount > 0
              ? `${pendingDocsCount} documents need to be verified before decision.`
              : 'Verify applicant documents before deciding on this application.'}
          </Text>
        </View>
        <Chip
          label="DOCS PENDING"
          tone={{
            bg: colors.tealSoft,
            fg: colors.tealDeep,
          }}
        />
      </View>

      <View style={styles.ctaBtnWrap}>
        {/* Only Primary Action: Review & Upload Documents */}
        <Pressable
          onPress={onReviewDocs}
          style={({ pressed }) => [
            styles.primaryActionBtn,
            pressed && styles.pressedOpacity,
          ]}
        >
          <FileTextIcon size={16} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.primaryActionBtnText}>Review & Upload Documents</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 15,
    marginVertical: 6,
  },
  successCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  rejectedCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  flexOne: {
    flex: 1,
  },
  markCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  markCircleGreen: {
    backgroundColor: colors.greenSoft,
  },
  markCircleRed: {
    backgroundColor: colors.redSoft,
  },
  markCircleTeal: {
    backgroundColor: colors.tealSoft,
  },
  markCircleAmber: {
    backgroundColor: colors.amberSoft,
  },
  cardTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: colors.navy,
  },
  rejectedTitle: {
    color: colors.red,
  },
  cardSub: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  ctaBtnWrap: {
    marginTop: 12,
  },
  btnContainer: {
    marginTop: 12,
    gap: 8,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  secondaryBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pressedOpacity: {
    opacity: 0.84,
  },
  primaryActionBtn: {
    height: 42,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  primaryActionBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  outlineActionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  outlineActionBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.navy,
  },
  dangerActionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  dangerActionBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.red,
  },
  approveActionBtn: {
    flex: 1.4,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#15803D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  approveActionBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  disburseActionBtn: {
    flex: 1.4,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  disburseActionBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  disburseCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 18,
    padding: 16,
    marginVertical: 6,
  },
  disburseTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  disburseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  disburseIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disburseTitleWrap: {
    flex: 1,
  },
  disburseTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: colors.navy,
  },
  disburseSub: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: '#15803D',
    marginTop: 1,
  },
  disburseNoticeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
  },
  disburseNoticeText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#166534',
    lineHeight: 17,
  },
  disburseActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  disburseHeroBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#15803D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disburseHeroBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  disburseSecondaryRejectBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  disburseSecondaryRejectText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#DC2626',
  },
});
