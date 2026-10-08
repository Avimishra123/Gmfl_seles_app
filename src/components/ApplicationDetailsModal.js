import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Btn, Chip } from './ui';
import { FileTextIcon } from './Icons';
import { colors, type } from '../theme';

function formatFieldKey(key, formFields = []) {
  if (!key) return '';
  const matched = formFields.find(
    (f) =>
      (f.name && f.name.toLowerCase() === key.toLowerCase()) ||
      (f.id && f.id.toLowerCase() === key.toLowerCase()) ||
      (f.code && f.code.toLowerCase() === key.toLowerCase())
  );
  if (matched && matched.label) {
    return matched.label;
  }
  // Convert camelCase or snake_case to Title Case
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatFieldValue(val) {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return '—';
    }
  }
  return String(val);
}

export function ApplicationDetailsModal({ visible, onClose, customer }) {
  if (!customer) return null;

  const service = customer?.serviceSnapshot || {};
  const formFields = service?.formFields || [];
  const applicantDetails = customer?.applicantDetails || customer?.formResponses || {};
  const loanDetails = customer?.loanDetails || null;

  const dynamicEntries = Object.entries(applicantDetails).filter(
    ([k]) => !['userId', 'serviceId', 'id'].includes(k)
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handleBar} />

          <View style={styles.headerRow}>
            <View style={styles.markCircle}>
              <FileTextIcon size={20} color={colors.tealDeep} />
            </View>
            <View style={styles.flexOne}>
              <Text style={styles.title}>Application Details</Text>
              <Text style={styles.trackingSub}>
                Tracking: {customer.trackingId || customer.app || '—'}
              </Text>
            </View>
            <Chip label={customer.statusLabel || customer.status || 'Active'} />
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Service & Product Overview */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionHeader}>Service Overview</Text>
              </View>
              <DetailRow label="Service Name" value={service.name || customer.serviceName || customer.product} />
              {service.categoryName ? <DetailRow label="Category" value={service.categoryName} /> : null}
              {service.bankName ? <DetailRow label="Bank Partner" value={service.bankName} /> : null}
              {service.isOnline !== undefined ? (
                <DetailRow label="Processing Mode" value={service.isOnline ? 'Online Application' : 'Offline Assisted'} />
              ) : null}
            </View>

            {/* Dynamic Form Responses */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionHeader}>Applicant Submitted Details</Text>
              </View>
              {dynamicEntries.length === 0 ? (
                <Text style={[type.muted, styles.emptyText]}>
                  No dynamic form responses recorded for this application.
                </Text>
              ) : (
                dynamicEntries.map(([key, val]) => (
                  <DetailRow
                    key={key}
                    label={formatFieldKey(key, formFields)}
                    value={formatFieldValue(val)}
                  />
                ))
              )}
            </View>

            {/* Loan Disbursal Details (if applicable) */}
            {loanDetails && (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionHeader}>Disbursed Loan Terms</Text>
                </View>
                <DetailRow label="Sanctioned Amount" value={`₹${loanDetails.loanAmount?.toLocaleString('en-IN')}`} />
                <DetailRow label="Interest Rate" value={`${loanDetails.interestRate}% p.a.`} />
                <DetailRow label="Tenure" value={`${loanDetails.totalNumberOfEmi} Months`} />
                <DetailRow label="Monthly EMI" value={`₹${loanDetails.emiAmount?.toLocaleString('en-IN')}`} />
                <DetailRow label="First EMI Date" value={loanDetails.firstEmiDate} />
              </View>
            )}

            <View style={styles.bottomSpacer} />
          </ScrollView>

          <Btn label="Close" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.line,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  flexOne: {
    flex: 1,
  },
  markCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Fraunces-Bold',
    fontSize: 18,
    color: colors.navy,
  },
  trackingSub: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  scrollArea: {
    marginVertical: 8,
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeader: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.tealDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyText: {
    paddingVertical: 8,
  },
  bottomSpacer: {
    height: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    gap: 12,
  },
  detailLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: colors.muted,
    flex: 1,
  },
  detailValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: colors.navy,
    textAlign: 'right',
    flex: 1.2,
  },
});
