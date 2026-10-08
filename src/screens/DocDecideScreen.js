import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Btn, Chip, Header, Screen, LoaderOverlay } from '../components/ui';
import { DocRejectModal } from '../components/DocRejectModal';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  FileTextIcon,
  UploadCloudIcon,
} from '../components/Icons';
import { useApp, useCustomer } from '../store';
import { useCustomerViewModel } from '../viewmodels/CustomerViewModel';
import { useDocsViewModel } from '../viewmodels/DocsViewModel';
import { ApiConstants } from '../network/ApiConstants';
import { colors, type } from '../theme';

export default function DocDecideScreen({ navigation, route }) {
  const id = route.params?.id;
  const docCode = route.params?.docCode;
  const index = Number(route.params?.index);
  const isApp = route.params?.isApp || false;

  const { showToast } = useApp();

  const mockCustomer = useCustomer(id);
  const { customer: apiCustomer } = useCustomerViewModel(id, isApp);
  const customer = apiCustomer || mockCustomer;

  const {
    checklist,
    loading,
    handleApproveDocument,
    handleRejectDocument,
    actionLoading,
  } = useDocsViewModel(id, isApp);

  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  // Find doc - prioritize fresh checklist data, then fallback to route params or customer
  const cleanDocCode = docCode ? String(docCode).trim().toUpperCase() : '';
  let doc = null;
  if (checklist && checklist.length > 0) {
    if (cleanDocCode) {
      doc = checklist.find((d) => (d.code || '').toUpperCase() === cleanDocCode);
    }
    if (!doc && !isNaN(index) && checklist[index]) {
      doc = checklist[index];
    }
  }

  if (!doc) {
    doc = route.params?.doc || null;
  }

  if (!doc && customer) {
    const raw = customer.documents || customer.docs || [];
    if (cleanDocCode) {
      doc = raw.find((d) => (d.code || '').toUpperCase() === cleanDocCode);
    }
    if (!doc && !isNaN(index) && raw[index]) {
      doc = raw[index];
    }
  }

  if (loading && !doc) {
    return (
      <Screen>
        <Header title="Document Details" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={[type.muted, styles.loadingText]}>Loading document details...</Text>
        </View>
      </Screen>
    );
  }

  if (!doc) {
    return (
      <Screen>
        <Header title="Document Preview" />
        <Text style={[type.muted, styles.notFoundText]}>Document details not found.</Text>
      </Screen>
    );
  }

  const docName = doc.name || 'Document';
  const fileUrl = doc.fileUrl;
  const resolvedUrl = fileUrl
    ? (fileUrl.startsWith('/') ? `${ApiConstants.BASE_URL}${fileUrl}` : fileUrl)
    : '';

  const isPdf = Boolean(
    doc.mimeType?.toLowerCase().includes('pdf') ||
    doc.fileType?.toLowerCase().includes('pdf') ||
    doc.type?.toLowerCase().includes('pdf') ||
    doc.fileName?.toLowerCase().endsWith('.pdf') ||
    resolvedUrl?.toLowerCase().includes('.pdf')
  );

  const isImage = Boolean(
    !isPdf &&
    (doc.mimeType?.toLowerCase().startsWith('image/') ||
      doc.fileName?.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ||
      resolvedUrl?.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|svg)/i) ||
      (resolvedUrl && !isPdf))
  );

  const docStatusNorm = String(doc.status || doc.state || '').toUpperCase();
  const isVerified = docStatusNorm === 'VERIFIED' || docStatusNorm === 'APPROVED';
  const isRejected = docStatusNorm === 'REJECTED';
  const isPendingReview = Boolean(fileUrl) && !isVerified && !isRejected;

  async function onApprove() {
    const code = doc.code || cleanDocCode;
    const success = await handleApproveDocument(code);
    if (success) {
      navigation.goBack();
    }
  }

  async function onConfirmReject(remarks) {
    const code = doc.code || cleanDocCode;
    const success = await handleRejectDocument(code, remarks);
    if (success) {
      setRejectModalVisible(false);
      navigation.goBack();
    }
  }

  async function openPdf() {
    if (!resolvedUrl) {
      showToast('No document URL available to open');
      return;
    }
    try {
      showToast('Opening PDF viewer...');
      const canOpen = await Linking.canOpenURL(resolvedUrl);
      if (canOpen) {
        await Linking.openURL(resolvedUrl);
        return;
      }
      await Linking.openURL(resolvedUrl);
    } catch (err) {
      console.warn('Direct PDF open failed:', err);
      if (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://')) {
        try {
          const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(resolvedUrl)}`;
          await Linking.openURL(viewerUrl);
          return;
        } catch (viewerErr) {
          console.warn('Google docs viewer failed:', viewerErr);
        }
      }
      showToast('Unable to open PDF viewer on device');
    }
  }

  function copyPdfLink() {
    if (!resolvedUrl) return;
    try {
      Clipboard.setString(resolvedUrl);
      showToast('PDF link copied to clipboard');
    } catch {
      showToast('Could not copy link');
    }
  }

  const customerName =
    customer?.userSnapshot?.fullName ||
    customer?.applicantName ||
    customer?.contactDetails?.fullName ||
    customer?.name ||
    '';

  return (
    <>
      <Screen>
        <Header
          title={docName}
          subtitle={customerName || 'Document Review'}
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Status Header Chip */}
          <View style={styles.badgeRow}>
            <Chip
              label={
                isVerified
                  ? 'VERIFIED'
                  : isRejected
                  ? 'REJECTED'
                  : fileUrl
                  ? 'PENDING REVIEW'
                  : 'NOT UPLOADED'
              }
              tone={{
                bg: isVerified
                  ? colors.greenSoft
                  : isRejected
                  ? colors.redSoft
                  : fileUrl
                  ? colors.tealSoft
                  : '#FEF3C7',
                fg: isVerified
                  ? colors.greenText
                  : isRejected
                  ? colors.red
                  : fileUrl
                  ? colors.tealDeep
                  : '#B45309',
              }}
            />
            {doc.isMandatory && (
              <Chip label="MANDATORY" tone={{ bg: '#FEE2E2', fg: '#B91C1C' }} />
            )}
          </View>

          {/* Rejection Alert Banner */}
          {isRejected ? (
            <View style={styles.rejectAlert}>
              <View style={styles.rejectHeader}>
                <AlertCircleIcon size={15} color={colors.red} />
                <Text style={styles.rejectAlertTitle}>Rejection Reason</Text>
              </View>
              <Text style={styles.rejectAlertText}>
                {doc.remarks || 'This document was rejected. Please re-upload a clear and valid document.'}
              </Text>
            </View>
          ) : null}

          {/* Document Preview Display */}
          {resolvedUrl ? (
            isImage ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: resolvedUrl }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={styles.pdfCard}>
                <View style={styles.pdfCardHeader}>
                  <View style={styles.pdfIconWrap}>
                    <FileTextIcon size={32} color="#DC2626" />
                  </View>
                  <View style={styles.pdfMetaInfo}>
                    <View style={styles.pdfBadgeRow}>
                      <View style={styles.pdfTypeTag}>
                        <Text style={styles.pdfTypeTagText}>PDF DOCUMENT</Text>
                      </View>
                      {doc.fileSize ? (
                        <Text style={styles.pdfFileSizeText}>
                          {Math.round(doc.fileSize / 1024)} KB
                        </Text>
                      ) : null}
                    </View>
                    <Text style={styles.pdfFileName} numberOfLines={1}>
                      {doc.fileName || `${docName}.pdf`}
                    </Text>
                    <Text style={styles.pdfStatusHint}>
                      Tap below to view full document
                    </Text>
                  </View>
                </View>

                <View style={styles.pdfActionsRow}>
                  <View style={styles.pdfMainBtnWrap}>
                    <Btn
                      label="View / Open PDF"
                      variant="primary"
                      onPress={openPdf}
                    />
                  </View>
                  <Pressable
                    onPress={copyPdfLink}
                    style={({ pressed }) => [
                      styles.pdfCopyBtn,
                      pressed && styles.pressedOpacity,
                    ]}
                  >
                    <ExternalLinkIcon size={16} color={colors.navy} />
                    <Text style={styles.pdfCopyBtnText}>Copy Link</Text>
                  </Pressable>
                </View>
              </View>
            )
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <UploadCloudIcon size={42} color="#B45309" />
              </View>
              <Text style={styles.emptyTitle}>Document Not Uploaded</Text>
              <Text style={styles.emptySubtitle}>
                The applicant has not yet provided this document. You can upload it on their behalf.
              </Text>
              <View style={styles.spacer14}>
                <Btn
                  label="Upload for Applicant"
                  variant="primary"
                  onPress={() =>
                    navigation.navigate('AgentUpload', {
                      id,
                      docCode: doc.code,
                      index: String(index),
                      back: 'DocDecide',
                      isApp,
                    })
                  }
                />
              </View>
            </View>
          )}

          {/* Document Metadata Card */}
          <View style={styles.metaCard}>
            <Text style={styles.metaTitle}>DOCUMENT DETAILS</Text>
            <MetaRow label="Document Name" value={doc.name || 'Document'} />
            <MetaRow
              label="Current Status"
              value={
                isVerified
                  ? 'Verified / Approved'
                  : isRejected
                  ? 'Rejected'
                  : fileUrl
                  ? 'Pending Review'
                  : 'Pending Upload'
              }
              highlight={isRejected}
            />
            {doc.uploadedByRole ? (
              <MetaRow
                label="Uploaded By"
                value={doc.uploadedByRole === 'AGENT' ? 'Sales Agent' : 'Applicant'}
              />
            ) : null}
            {isVerified && (doc.verifiedRole || doc.verifiedBy) ? (
              <MetaRow
                label="Verified By"
                value={doc.verifiedRole === 'ADMIN' ? 'Administrator' : 'Sales Agent'}
              />
            ) : null}
          </View>

          {/* Action Row */}
          <View style={styles.actionSection}>
            {/* Case 1: Already Verified / Approved Document */}
            {isVerified && (
              <View>
                <View style={styles.verifiedAlert}>
                  <View style={styles.verifiedHeader}>
                    <CheckCircleIcon size={16} color="#15803D" />
                    <Text style={styles.verifiedAlertTitle}>Document Verified</Text>
                  </View>
                  <Text style={styles.verifiedAlertText}>
                    This document has already been verified and accepted. No further decision is required.
                  </Text>
                </View>

                {fileUrl ? (
                  <View style={styles.spacer10}>
                    <Btn
                      label="Replace / Re-upload File"
                      variant="ghost"
                      onPress={() =>
                        navigation.navigate('AgentUpload', {
                          id,
                          docCode: doc.code,
                          index: String(index),
                          back: 'DocDecide',
                          isApp,
                        })
                      }
                      disabled={actionLoading}
                    />
                  </View>
                ) : null}
              </View>
            )}

            {/* Case 2: Rejected Document - Only allow re-uploading replacement */}
            {isRejected && (
              <View>
                <Btn
                  label="Re-upload Replacement Document"
                  variant="primary"
                  onPress={() =>
                    navigation.navigate('AgentUpload', {
                      id,
                      docCode: doc.code,
                      index: String(index),
                      back: 'DocDecide',
                      isApp,
                    })
                  }
                  disabled={actionLoading}
                />
              </View>
            )}

            {/* Case 3: Pending Review - Has uploaded file, awaiting agent decision */}
            {isPendingReview && (
              <View>
                <View style={styles.btnRow}>
                  <Btn
                    label={actionLoading ? 'Approving...' : 'Approve Document'}
                    flex
                    variant="primary"
                    onPress={onApprove}
                    disabled={actionLoading}
                  />
                  <Btn
                    label="Reject"
                    variant="danger"
                    flex
                    onPress={() => setRejectModalVisible(true)}
                    disabled={actionLoading}
                  />
                </View>

                <View style={styles.spacer10}>
                  <Btn
                    label="Replace / Re-upload File"
                    variant="ghost"
                    onPress={() =>
                      navigation.navigate('AgentUpload', {
                        id,
                        docCode: doc.code,
                        index: String(index),
                        back: 'DocDecide',
                        isApp,
                      })
                    }
                    disabled={actionLoading}
                  />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </Screen>

      {/* Document Rejection Modal */}
      <DocRejectModal
        visible={rejectModalVisible}
        doc={doc}
        onClose={() => setRejectModalVisible(false)}
        onConfirm={onConfirmReject}
        loading={actionLoading}
      />

      <LoaderOverlay visible={actionLoading} />
    </>
  );
}

function MetaRow({ label, value, highlight = false }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text
        style={[
          styles.metaValue,
          highlight && styles.metaValueHighlight,
        ]}
      >
        {value || '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  rejectAlert: {
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
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
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
  },
  verifiedAlert: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  verifiedAlertTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#15803D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verifiedAlertText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },
  notFoundText: {
    marginTop: 16,
  },
  spacer10: {
    marginTop: 10,
  },
  spacer12: {
    marginTop: 12,
  },
  spacer14: {
    marginTop: 14,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  imageContainer: {
    height: 380,
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    overflow: 'hidden',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  pdfCard: {
    padding: 18,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 12,
  },
  pdfCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  pdfIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfMetaInfo: {
    flex: 1,
  },
  pdfBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pdfTypeTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  pdfTypeTagText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 9,
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  pdfFileSizeText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: colors.muted,
  },
  pdfFileName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: colors.navy,
  },
  pdfStatusHint: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  pdfActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pdfMainBtnWrap: {
    flex: 1,
  },
  pdfCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pdfCopyBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.navy,
  },
  pressedOpacity: {
    opacity: 0.8,
  },
  emptyCard: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyTitle: {
    fontFamily: 'Fraunces-Bold',
    fontSize: 17,
    color: '#92400E',
  },
  emptySubtitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: '#B45309',
    textAlign: 'center',
    marginTop: 4,
  },
  metaCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  metaTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  metaLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: colors.muted,
    flex: 1,
  },
  metaValue: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 13,
    color: colors.navy,
    flex: 1.4,
    textAlign: 'right',
  },
  metaValueHighlight: {
    color: colors.red,
    fontFamily: 'DMSans-Bold',
  },
  actionSection: {
    marginBottom: 32,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
