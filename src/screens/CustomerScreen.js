import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import {
  ChevronRightIcon,
  FileTextIcon,
  PhoneIcon,
  ProfileIcon,
} from '../components/Icons';
import { Chip, Header, Screen, LoaderOverlay } from '../components/ui';
import { ApplicationStepper } from '../components/ApplicationStepper';
import { ApplicationActionCard } from '../components/ApplicationActionCard';
import { ApplicationDetailsModal } from '../components/ApplicationDetailsModal';
import { ApplicationDetailSkeleton } from '../components/ApplicationDetailSkeleton';
import { ContactModal } from '../components/ContactModal';
import { RejectModal } from '../components/RejectModal';
import { DisburseModal } from '../components/DisburseModal';
import { LeadStepper } from '../components/LeadStepper';
import { LeadActionCard } from '../components/LeadActionCard';
import { DropLeadModal } from '../components/DropLeadModal';
import { LeadNotesSection } from '../components/LeadNotesSection';
import { useApp, useCustomer } from '../store';
import { useCustomerViewModel } from '../viewmodels/CustomerViewModel';
import { colors, getApplicationMeta, isLeadProduct, isRedundantService, type } from '../theme';

export default function CustomerDetailScreen({ navigation, route }) {
  const id = route.params?.id;
  const isApp = route.params?.isApp || false;
  const mockCustomer = useCustomer(id);
  const { showToast } = useApp();

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [disburseModalVisible, setDisburseModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [dropLeadModalVisible, setDropLeadModalVisible] = useState(false);

  const {
    customer: apiCustomer,
    loading,
    actionLoading,
    handleApprove,
    handleReject,
    handleDisburse,
    handleStatusUpdate,
    handleLeadStatusUpdate,
    handleAddLeadNote,
  } = useCustomerViewModel(id, isApp);

  const customer = apiCustomer || mockCustomer;

  if (loading && !apiCustomer) {
    return <ApplicationDetailSkeleton />;
  }

  if (!customer) {
    return (
      <Screen>
        <Header title="Customer" />
        <Text style={[type.muted, styles.emptyText]}>This file is no longer available.</Text>
      </Screen>
    );
  }

  const userSnapshot = customer?.userSnapshot || customer?.user || {};

  const name =
    userSnapshot.fullName ||
    userSnapshot.name ||
    customer?.applicantName ||
    customer?.contactDetails?.fullName ||
    customer?.name ||
    'Unknown';

  const mobile =
    userSnapshot.phoneNumber ||
    userSnapshot.phone ||
    customer?.applicantPhone ||
    customer?.contactDetails?.phoneNumber ||
    customer?.mobile ||
    '';

  const emailVal =
    userSnapshot.email ||
    customer?.contactDetails?.email ||
    customer?.email ||
    '';

  const status = customer.statusLabel || customer.status || 'Pending';
  const appDate = customer.createdAt
    ? typeof customer.createdAt === 'object' && customer.createdAt._seconds
      ? new Date(customer.createdAt._seconds * 1000).toLocaleDateString('en-IN')
      : new Date(customer.createdAt).toLocaleDateString('en-IN')
    : customer.date || '';

  const bankName =
    customer?.serviceSnapshot?.bankName ||
    customer?.serviceSnapshot?.bank ||
    customer?.service?.bankName ||
    customer?.service?.bank ||
    customer?.bankName ||
    customer?.bank ||
    customer?.partnerBank ||
    customer?.partner ||
    customer?.provider ||
    customer?.institution ||
    customer?.applicantDetails?.bankName ||
    customer?.applicantDetails?.bank ||
    '';
  const productName = customer?.serviceSnapshot?.name || customer.serviceName || customer.product;
  const appId = customer.trackingId || customer.app || id;

  const categoryStr = (customer?.serviceSnapshot?.categoryName || '').toLowerCase();
  const productStr = (customer?.serviceSnapshot?.name || customer.serviceName || customer.product || '').toLowerCase();

  const isInsurance =
    customer.line === 'insurance' ||
    customer.serviceType === 'insurance' ||
    categoryStr.includes('insurance') ||
    productStr.includes('insurance');
  const isMutual =
    customer.line === 'mutual' ||
    customer.serviceType === 'mutual' ||
    categoryStr.includes('mutual') ||
    productStr.includes('mutual');

  const serviceName =
    customer?.serviceSnapshot?.name ||
    customer.serviceName ||
    customer.product ||
    'Service';
  const serviceType =
    customer?.serviceSnapshot?.categoryName ||
    customer.categoryName ||
    customer.serviceType ||
    (isMutual ? 'Mutual Funds' : isInsurance ? 'Insurance' : customer.line ? customer.line.charAt(0).toUpperCase() + customer.line.slice(1) : 'Service');

  const isLeadTracking = (appId || '').includes('LEAD');
  const lead = !isApp && (isLeadProduct(customer) || isInsurance || isMutual || isLeadTracking);

  async function dial() {
    const tel = `tel:${mobile.replace(/[^\d+]/g, '')}`;
    try {
      await Linking.openURL(tel);
    } catch {
      showToast('Calling is not available on this device');
    }
  }

  async function onConfirmReject(remarks) {
    const success = await handleReject(remarks);
    if (success) {
      setRejectModalVisible(false);
    }
  }

  async function onConfirmDisburse(payload) {
    const success = await handleDisburse(payload);
    if (success) {
      setDisburseModalVisible(false);
    }
  }

  async function onConfirmDropLead(remarks) {
    const success = await handleLeadStatusUpdate('DROPPED', remarks);
    if (success) {
      setDropLeadModalVisible(false);
    }
  }

  return (
    <>
      <Screen>
        <Header title={name} />

        {/* Visual Pipeline Stepper: Loan Application vs Lead Lifecycle */}
        {!lead ? (
          <ApplicationStepper status={customer.status} />
        ) : (
          <LeadStepper
            status={customer.status}
            dropRemarks={customer.agentRemarks}
          />
        )}

        {/* Customer Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.markCircle}>
              <ProfileIcon color={colors.navy} />
            </View>
            <View style={styles.flexOne}>
              <Text style={styles.applicantName}>{name}</Text>
              {!lead ? (
                <Text style={styles.productSub}>
                  {getApplicationMeta(
                    bankName,
                    customer?.serviceSnapshot?.categoryName || customer?.categoryName,
                    productName
                  )}
                </Text>
              ) : null}
            </View>
            <Chip label={status.replace(/_/g, ' ')} />
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoList}>
            {/* Mobile with Quick Call Pill */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mobile</Text>
              <View style={styles.phoneValueWrap}>
                <Text style={styles.infoValue}>{mobile || '—'}</Text>
                {mobile ? (
                  <Pressable onPress={dial} style={styles.callBadge}>
                    <PhoneIcon size={12} color={colors.greenText} />
                    <Text style={styles.callBadgeText}>Call</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            {lead ? (
              <>
                <InfoItem label="Bank Name" value={bankName || '—'} />
                {isRedundantService(serviceType, serviceName) ? (
                  <InfoItem
                    label="Service"
                    value={serviceType.length >= serviceName.length ? serviceType : serviceName}
                  />
                ) : (
                  <>
                    {serviceType ? <InfoItem label="Service Type" value={serviceType} /> : null}
                    {serviceName ? <InfoItem label="Service Name" value={serviceName} /> : null}
                  </>
                )}
              </>
            ) : (
              <>
                {isInsurance ? (
                  <>
                    <InfoItem label="Cover" value={customer.cover || '-'} />
                    <InfoItem label="Premium" value={customer.premium || '-'} />
                  </>
                ) : null}

                {isMutual ? (
                  <>
                    <InfoItem label="Mutual fund" value={customer.scheme || productName} />
                    <InfoItem label="Amount" value={customer.amount || '-'} />
                  </>
                ) : null}
              </>
            )}

            {emailVal ? <InfoItem label="Email" value={emailVal} /> : null}
            <InfoItem label={lead ? 'Lead Date' : 'Application Date'} value={appDate} />
            {!lead && customer.trackingId ? (
              <InfoItem label="Tracking ID" value={customer.trackingId} />
            ) : null}
          </View>
        </View>

        {/* State-Driven Contextual Action Card: Loan Applications vs Leads */}
        {!lead ? (
          <ApplicationActionCard
            customer={customer}
            loading={actionLoading}
            onReviewDocs={() => navigation.navigate('DocReview', { id: customer?.id || id, isApp: true, customer })}
            onApprove={() => handleApprove()}
            onOpenReject={() => setRejectModalVisible(true)}
            onOpenDisburse={() => setDisburseModalVisible(true)}
            onMarkUnderReview={() => handleStatusUpdate('UNDER_REVIEW', 'Moved to review by salesperson')}
            onReopenReview={() => handleStatusUpdate('UNDER_REVIEW', 'Reopened for review by salesperson')}
          />
        ) : (
          <LeadActionCard
            customer={customer}
            loading={actionLoading}
            onUpdateStatus={(newStatus, remarks) => handleLeadStatusUpdate(newStatus, remarks)}
            onOpenDropModal={() => setDropLeadModalVisible(true)}
          />
        )}

        {/* Lead Follow-Up Notes Section */}
        {lead && (
          <LeadNotesSection
            notes={customer?.notesHistory || []}
            onAddNote={(note) => handleAddLeadNote(note)}
            loading={actionLoading}
          />
        )}

        {/* Unified Quick Actions Card */}
        <View style={styles.quickActionsCard}>
          {!lead && (
            <>
              <Pressable
                onPress={() => setDetailsModalVisible(true)}
                style={({ pressed }) => [styles.actionItem, pressed && styles.pressedOpacity]}
              >
                <View style={[styles.actionIconWrap, styles.bgTealSoft]}>
                  <FileTextIcon size={18} color={colors.tealDeep} />
                </View>
                <View style={styles.flexOne}>
                  <Text style={styles.actionTitle}>Application details</Text>
                  <Text style={styles.actionSub}>View dynamic form responses & terms</Text>
                </View>
                <ChevronRightIcon size={18} color="#94A3B8" />
              </Pressable>
              <View style={styles.actionDivider} />
            </>
          )}

          <Pressable
            onPress={() => setContactModalVisible(true)}
            style={({ pressed }) => [styles.actionItem, pressed && styles.pressedOpacity]}
          >
            <View style={[styles.actionIconWrap, styles.bgGreenSoft]}>
              <PhoneIcon size={16} color={colors.greenText} />
            </View>
            <View style={styles.flexOne}>
              <Text style={styles.actionTitle}>Contact applicant</Text>
              <Text style={styles.actionSub}>Call, WhatsApp templates, or SMS</Text>
            </View>
            <ChevronRightIcon size={18} color="#94A3B8" />
          </Pressable>
        </View>
      </Screen>

      {/* Dynamic Application Details Modal */}
      <ApplicationDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        customer={customer}
      />

      {/* Enhanced Contact Modal */}
      <ContactModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
        customer={customer}
        onShowToast={showToast}
      />

      {/* Rejection Modal for Applications */}
      <RejectModal
        visible={rejectModalVisible}
        onClose={() => setRejectModalVisible(false)}
        onConfirm={onConfirmReject}
        loading={actionLoading}
      />

      {/* Drop Modal for Leads */}
      <DropLeadModal
        visible={dropLeadModalVisible}
        onClose={() => setDropLeadModalVisible(false)}
        onConfirm={onConfirmDropLead}
        loading={actionLoading}
      />

      {/* Disbursal Modal */}
      {disburseModalVisible && (
        <DisburseModal
          visible={disburseModalVisible}
          initialAmount={customer?.applicantDetails?.loan_amount || customer?.applicantDetails?.amount || customer?.amount || ''}
          onClose={() => setDisburseModalVisible(false)}
          onConfirm={onConfirmDisburse}
          loading={actionLoading}
        />
      )}

      {/* Full-Screen Activity Blocker for Status Mutations */}
      <LoaderOverlay visible={actionLoading} />
    </>
  );
}

function InfoItem({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value || '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    marginTop: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 15,
    marginVertical: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flexOne: {
    flex: 1,
  },
  markCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applicantName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: colors.navy,
  },
  productSub: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 10,
  },
  infoList: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  infoLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: colors.muted,
  },
  infoValue: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 13,
    color: colors.navy,
    textAlign: 'right',
    flexShrink: 1,
  },
  phoneValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  callBadgeText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: colors.greenText,
  },
  quickActionsCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    paddingVertical: 4,
    marginTop: 8,
    marginBottom: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgTealSoft: {
    backgroundColor: colors.tealSoft,
  },
  bgGreenSoft: {
    backgroundColor: colors.greenSoft,
  },
  actionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: colors.navy,
  },
  actionSub: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: colors.muted,
    marginTop: 1,
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 14,
  },
  pressedOpacity: {
    opacity: 0.82,
  },
});
