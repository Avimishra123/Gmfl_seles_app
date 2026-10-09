import { useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Btn, Chip, Header, Screen, LoaderOverlay } from '../components/ui';
import { DocReviewSkeleton } from '../components/DocReviewSkeleton';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  CheckIcon,
  EyeIcon,
  FileTextIcon,
  RefreshIcon,
  UploadCloudIcon,
  XIcon,
} from '../components/Icons';
import { DocRejectModal } from '../components/DocRejectModal';
import { useApp, useCustomer } from '../store';
import { useCustomerViewModel } from '../viewmodels/CustomerViewModel';
import { useDocsViewModel } from '../viewmodels/DocsViewModel';
import { colors, type } from '../theme';

const STATIC_DOCUMENTS = [
  {
    code: 'PAN_CARD',
    name: 'PAN Card (Front)',
    isMandatory: true,
    status: 'PENDING_REVIEW',
    fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    fileName: 'pan_card_applicant.jpg',
    remarks: '',
    uploadedByRole: 'USER',
  },
  {
    code: 'PASSPORT',
    name: 'Indian Passport',
    isMandatory: true,
    status: 'VERIFIED',
    fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800',
    fileName: 'passport_verified.pdf',
    remarks: '',
    uploadedByRole: 'USER',
  },
  {
    code: 'BANK_STATEMENT',
    name: 'Last 6 Months Bank Statement',
    isMandatory: true,
    status: 'VERIFIED',
    fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    fileName: 'bank_statement.pdf',
    remarks: '',
    uploadedByRole: 'AGENT',
  },
  {
    code: 'AADHAAR_CARD',
    name: 'Aadhaar Card (Front & Back)',
    isMandatory: true,
    status: 'PENDING_UPLOAD',
    fileUrl: null,
    fileName: null,
    remarks: '',
    uploadedByRole: 'USER',
  },
  {
    code: 'ITR_RETURN',
    name: 'Last 2 Years Income Tax Returns (ITR)',
    isMandatory: true,
    status: 'REJECTED',
    fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
    fileName: 'itr_v_acknowledgement.pdf',
    remarks: 'Document is blurry and financial year 2024-25 statement is missing.',
    uploadedByRole: 'USER',
  },
  {
    code: 'ELECTRICITY_BILL',
    name: 'Latest Electricity / Utility Bill',
    isMandatory: false,
    status: 'PENDING_UPLOAD',
    fileUrl: null,
    fileName: null,
    remarks: '',
    uploadedByRole: 'USER',
  },
  {
    code: 'RENT_AGREEMENT',
    name: 'Registered Rent Agreement',
    isMandatory: false,
    status: 'VERIFIED',
    fileUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
    fileName: 'rent_agreement.pdf',
    remarks: '',
    uploadedByRole: 'AGENT',
  },
];

function statusBadge(status, uploadedByRole) {
  const norm = String(status || '').toUpperCase();
  if (norm === 'VERIFIED' || norm === 'APPROVED') {
    return {
      label: uploadedByRole === 'AGENT' ? 'Verified by Agent' : 'Verified',
      tone: { bg: colors.greenSoft, fg: colors.greenText },
      iconBg: colors.greenSoft,
      renderIcon: (size = 18) => <CheckCircleIcon size={size} color={colors.greenText} />,
    };
  }
  if (norm === 'REJECTED') {
    return {
      label: 'Rejected',
      tone: { bg: colors.redSoft, fg: colors.red },
      iconBg: colors.redSoft,
      renderIcon: (size = 18) => <AlertCircleIcon size={size} color={colors.red} />,
    };
  }
  if (norm === 'PENDING_REVIEW' || norm === 'PENDING' || norm === 'UNDER_REVIEW') {
    return {
      label: 'Needs Review',
      tone: { bg: colors.tealSoft, fg: colors.tealDeep },
      iconBg: colors.tealSoft,
      renderIcon: (size = 18) => <FileTextIcon size={size} color={colors.tealDeep} />,
    };
  }
  return {
    label: 'Upload Pending',
    tone: { bg: '#FEF3C7', fg: '#B45309' },
    iconBg: '#FEF3C7',
    renderIcon: (size = 18) => <UploadCloudIcon size={size} color="#B45309" />,
  };
}

export default function DocReviewScreen({ navigation, route }) {
  const id = route.params?.id;
  const isApp = route.params?.isApp !== undefined ? route.params?.isApp : true;

  const { showToast } = useApp();
  const routeCustomer = route.params?.customer;
  const mockCustomer = useCustomer(id);
  const { customer: apiCustomer } = useCustomerViewModel(id, isApp);
  const customer = routeCustomer || apiCustomer || mockCustomer;

  const {
    checklist,
    summary,
    loading: docsLoading,
    actionLoading,
    refetch,
    handleApproveDocument,
    handleRejectDocument,
  } = useDocsViewModel(id, isApp);

  const { handleApprove, actionLoading: appActionLoading } = useCustomerViewModel(id, isApp);

  const customerStatus = String(customer?.status || '').toUpperCase();
  const isDisbursed = customerStatus === 'DISBURSED' || customerStatus === 'COMPLETED';

  const [items, setItems] = useState(() => (checklist && checklist.length > 0 ? checklist : STATIC_DOCUMENTS));
  const [rejectingDoc, setRejectingDoc] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (checklist && checklist.length > 0) {
      setItems(checklist);
    }
  }, [checklist]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetch();
    });
    return unsubscribe;
  }, [navigation, refetch]);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  async function onApproveDoc(docCode) {
    const cleanCode = String(docCode || '').trim().toUpperCase();
    setItems((prev) =>
      prev.map((d) =>
        (d.code || '').toUpperCase() === cleanCode
          ? { ...d, status: 'VERIFIED', uploadedByRole: 'AGENT' }
          : d
      )
    );
    showToast('Verifying document...');
    const success = await handleApproveDocument(cleanCode);
    if (!success && checklist && checklist.length > 0) {
      setItems(checklist);
    }
  }

  async function onConfirmReject(remarks) {
    if (!rejectingDoc) return;
    const cleanCode = String(rejectingDoc.code || '').trim().toUpperCase();
    const docName = rejectingDoc.name || cleanCode;
    setItems((prev) =>
      prev.map((d) =>
        (d.code || '').toUpperCase() === cleanCode
          ? { ...d, status: 'REJECTED', remarks }
          : d
      )
    );
    showToast(`Rejecting ${docName}...`);
    const success = await handleRejectDocument(cleanCode, remarks);
    if (!success && checklist && checklist.length > 0) {
      setItems(checklist);
    }
    setRejectingDoc(null);
  }

  const mandatoryItems = items.filter((d) => d.isMandatory !== false);
  const optionalItems = items.filter((d) => d.isMandatory === false);

  const allMandatoryDone =
    summary?.canApprove !== undefined
      ? summary.canApprove
      : (mandatoryItems.length > 0 && mandatoryItems.every((d) => {
          const s = String(d.status || '').toUpperCase();
          return s === 'VERIFIED' || s === 'APPROVED';
        }));

  const customerName =
    customer?.userSnapshot?.fullName ||
    customer?.applicantName ||
    customer?.name ||
    'Abhay';
  const customerProduct =
    customer?.serviceSnapshot?.name ||
    customer?.serviceName ||
    customer?.product ||
    'Test loan';

  function openPreview(doc, index) {
    navigation.navigate('DocDecide', {
      id,
      docCode: doc.code,
      doc,
      index: String(index),
      isApp,
    });
  }

  function openUpload(doc, index) {
    navigation.navigate('AgentUpload', {
      id,
      docCode: doc.code,
      index: String(index),
      back: 'DocReview',
      isApp,
    });
  }

  if (initialLoading || (docsLoading && items.length === 0)) {
    return <DocReviewSkeleton />;
  }

  return (
    <>
      <Screen>
        <Header
          title="Document review"
          subtitle={`${customerName} · ${customerProduct}`}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >

          {/* Mandatory Documents Section */}
          <Text style={[styles.sectionTitle, styles.sectionTopSpace]}>
            MANDATORY DOCUMENTS ({mandatoryItems.length})
          </Text>
          <View style={styles.card}>
            {mandatoryItems.length === 0 ? (
              <Text style={type.muted}>No mandatory documents required for this service.</Text>
            ) : (
              mandatoryItems.map((doc, idx) => (
                <DocItemRow
                  key={doc.code || idx}
                  doc={doc}
                  index={idx}
                  isLast={idx === mandatoryItems.length - 1}
                  onInspect={() => openPreview(doc, idx)}
                  onUpload={() => openUpload(doc, idx)}
                  onApprove={() => onApproveDoc(doc.code)}
                  onReject={() => setRejectingDoc(doc)}
                  disabled={false}
                  isDisbursed={isDisbursed}
                />
              ))
            )}
          </View>

          {/* Optional Documents Section */}
          {optionalItems.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, styles.sectionOptionalTopSpace]}>
                ADDITIONAL / OPTIONAL DOCUMENTS ({optionalItems.length})
              </Text>
              <View style={styles.card}>
                {optionalItems.map((doc, idx) => (
                  <DocItemRow
                    key={doc.code || idx}
                    doc={doc}
                    index={idx}
                    isLast={idx === optionalItems.length - 1}
                    onInspect={() => openPreview(doc, idx)}
                    onUpload={() => openUpload(doc, idx)}
                    onApprove={() => onApproveDoc(doc.code)}
                    onReject={() => setRejectingDoc(doc)}
                    disabled={false}
                    isDisbursed={isDisbursed}
                  />
                ))}
              </View>
            </>
          )}

          {/* Bottom Call-To-Action */}
          {allMandatoryDone && !isDisbursed ? (
            <View style={styles.ctaBox}>
              <View style={styles.ctaHeaderRow}>
                <CheckCircleIcon size={20} color={colors.greenText} />
                <Text style={styles.ctaTitle}>Ready for Application Approval</Text>
              </View>
              <Text style={styles.ctaSubtitle}>
                Every mandatory document is verified. You can now approve this application.
              </Text>
              <View style={styles.ctaBtnWrap}>
                <Btn
                  label={appActionLoading ? 'Approving Application...' : 'Approve Application'}
                  variant="primary"
                  onPress={async () => {
                    const success = await handleApprove('Approved after document verification');
                    if (success) {
                      navigation.goBack();
                    }
                  }}
                  disabled={appActionLoading}
                />
              </View>
            </View>
          ) : (
            <View style={styles.bottomSpacer} />
          )}
        </ScrollView>
      </Screen>

      {/* Dedicated Document Rejection Bottom Sheet Modal */}
      <DocRejectModal
        visible={Boolean(rejectingDoc)}
        doc={rejectingDoc}
        onClose={() => setRejectingDoc(null)}
        onConfirm={onConfirmReject}
        loading={actionLoading}
      />

      <LoaderOverlay visible={actionLoading || appActionLoading} />
    </>
  );
}

function DocItemRow({
  doc,
  isLast,
  onInspect,
  onUpload,
  onApprove,
  onReject,
  disabled,
  isDisbursed,
}) {
  const badgeInfo = statusBadge(doc.status, doc.uploadedByRole);
  const norm = String(doc.status || '').toUpperCase();
  const isUploaded = Boolean(doc.fileUrl || doc.isUploaded || norm === 'VERIFIED' || norm === 'APPROVED');
  const isRejected = norm === 'REJECTED';
  const isPendingUpload = norm === 'PENDING_UPLOAD' || (!isUploaded && !isRejected);
  const isPendingReview = isUploaded && (norm === 'PENDING_REVIEW' || norm === 'PENDING' || norm === 'UNDER_REVIEW');
  const isVerified = norm === 'VERIFIED' || norm === 'APPROVED';

  return (
    <View style={[styles.docRow, !isLast && styles.borderBottom]}>
      <Pressable
        onPress={isUploaded ? onInspect : onUpload}
        style={({ pressed }) => [
          styles.topRow,
          pressed && styles.pressedOpacity,
        ]}
      >
        <View style={[styles.markCircle, { backgroundColor: badgeInfo.iconBg }]}>
          {badgeInfo.renderIcon(20)}
        </View>

        <View style={styles.flexOne}>
          <View style={styles.titleWrap}>
            <Text style={styles.docTitle}>{doc.name}</Text>
            {doc.isMandatory && (
              <View style={styles.requiredPill}>
                <Text style={styles.requiredPillText}>REQUIRED</Text>
              </View>
            )}
          </View>
        </View>

        <Chip label={badgeInfo.label} tone={badgeInfo.tone} />
      </Pressable>

      {/* Rejection Remark Alert Box */}
      {isRejected && doc.remarks ? (
        <View style={styles.rejectAlert}>
          <View style={styles.rejectHeader}>
            <AlertCircleIcon size={14} color={colors.red} />
            <Text style={styles.rejectAlertTitle}>Rejection Reason</Text>
          </View>
          <Text style={styles.rejectAlertText}>{doc.remarks}</Text>
        </View>
      ) : null}

      {/* Action Row */}
      {(isPendingUpload || isRejected || isPendingReview || (isVerified && isUploaded) || (isDisbursed && isUploaded)) && (
        <View style={styles.actionRow}>
          {isDisbursed ? (
            isUploaded && (
              <Pressable
                onPress={onInspect}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.inspectBtnFull,
                  pressed && styles.pressedOpacity,
                ]}
              >
                <EyeIcon size={15} color={colors.navy} />
                <Text style={styles.inspectBtnText}>Review Document</Text>
              </Pressable>
            )
          ) : (
            <>
              {/* If Not Uploaded: Agent can upload directly */}
              {isPendingUpload && (
                <Pressable
                  onPress={onUpload}
                  disabled={disabled}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.uploadBtn,
                    pressed && styles.pressedOpacity,
                  ]}
                >
                  <UploadCloudIcon size={15} color="#C2410C" />
                  <Text style={styles.uploadBtnText}>Upload for Applicant</Text>
                </Pressable>
              )}

              {/* If Rejected: Agent can re-upload replacement or review details */}
              {isRejected && (
                <View style={styles.decisionBtnRow}>
                  {isUploaded && (
                    <Pressable
                      onPress={onInspect}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        styles.inspectBtnHalf,
                        pressed && styles.pressedOpacity,
                      ]}
                    >
                      <EyeIcon size={14} color={colors.navy} />
                      <Text style={styles.inspectBtnText}>Review</Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={onUpload}
                    disabled={disabled}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      isUploaded ? styles.reuploadBtnHalf : styles.reuploadBtn,
                      pressed && styles.pressedOpacity,
                    ]}
                  >
                    <RefreshIcon size={14} color={colors.red} />
                    <Text style={styles.reuploadBtnText}>Re-upload Document</Text>
                  </Pressable>
                </View>
              )}

              {/* If Pending Review: Two-tier layout for spacious review & decision */}
              {isPendingReview && (
                <View style={styles.pendingActionWrap}>
                  <Pressable
                    onPress={onInspect}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.inspectBtnFull,
                      pressed && styles.pressedOpacity,
                    ]}
                  >
                    <EyeIcon size={15} color={colors.navy} />
                    <Text style={styles.inspectBtnText}>Review Document</Text>
                  </Pressable>

                  <View style={styles.decisionBtnRow}>
                    <Pressable
                      onPress={onApprove}
                      disabled={disabled}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        styles.quickApproveBtn,
                        pressed && styles.pressedOpacity,
                      ]}
                    >
                      <CheckIcon size={14} color="#15803D" strokeWidth={2.5} />
                      <Text style={styles.quickApproveText}>Approve</Text>
                    </Pressable>
                    <Pressable
                      onPress={onReject}
                      disabled={disabled}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        styles.quickRejectBtn,
                        pressed && styles.pressedOpacity,
                      ]}
                    >
                      <XIcon size={14} color={colors.red} strokeWidth={2.5} />
                      <Text style={styles.quickRejectText}>Reject</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* If Verified & Uploaded: Single Review Button */}
              {isVerified && isUploaded && (
                <Pressable
                  onPress={onInspect}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.inspectBtnFull,
                    pressed && styles.pressedOpacity,
                  ]}
                >
                  <EyeIcon size={15} color={colors.navy} />
                  <Text style={styles.inspectBtnText}>Review Document</Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  sectionTopSpace: {
    marginTop: 16,
  },
  sectionOptionalTopSpace: {
    marginTop: 18,
  },
  ctaBtnWrap: {
    marginTop: 12,
  },
  bottomSpacer: {
    height: 24,
  },
  pressedOpacity: {
    opacity: 0.82,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    paddingHorizontal: 14,
  },
  docRow: {
    paddingVertical: 14,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  docTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: colors.navy,
  },
  requiredPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requiredPillText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 9,
    color: '#B91C1C',
  },
  rejectAlert: {
    marginTop: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
  },
  rejectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  rejectAlertTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: colors.red,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rejectAlertText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 16,
  },
  actionRow: {
    marginTop: 12,
  },
  pendingActionWrap: {
    width: '100%',
    gap: 8,
  },
  inspectBtnFull: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.line,
    width: '100%',
    paddingVertical: 9,
  },
  inspectBtnHalf: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.line,
    flex: 1,
  },
  reuploadBtnHalf: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flex: 1.5,
  },
  decisionBtnRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  uploadBtn: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    width: '100%',
  },
  uploadBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#C2410C',
  },
  reuploadBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    width: '100%',
  },
  reuploadBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.red,
  },
  inspectBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.navy,
  },
  quickApproveBtn: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    flex: 1,
  },
  quickApproveText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#15803D',
  },
  quickRejectBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flex: 1,
  },
  quickRejectText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.red,
  },
  ctaBox: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 18,
    padding: 16,
  },
  ctaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaTitle: {
    fontFamily: 'Fraunces-Bold',
    fontSize: 16,
    color: colors.greenText,
  },
  ctaSubtitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#166534',
    marginTop: 4,
  },
});
