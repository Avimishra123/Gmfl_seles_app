import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Chip, Header, Screen, LoaderOverlay } from '../components/ui';
import { useApp, useCustomer } from '../store';
import { useCustomerViewModel } from '../viewmodels/CustomerViewModel';
import { useDocsViewModel } from '../viewmodels/DocsViewModel';
import { pickDocument } from '../pickFile';
import { CheckCircleIcon, FileTextIcon, UploadCloudIcon } from '../components/Icons';
import { colors } from '../theme';

function readUriAsBase64(uri) {
  return new Promise((resolve, reject) => {
    fetch(uri)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ base64: reader.result, size: blob.size });
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
}

export default function AgentUploadScreen({ navigation, route }) {
  const id = route.params?.id;
  const docCode = route.params?.docCode;
  const index = Number(route.params?.index);
  const isApp = route.params?.isApp || false;

  const mockCustomer = useCustomer(id);
  const { customer: apiCustomer } = useCustomerViewModel(id, isApp);
  const customer = apiCustomer || mockCustomer;

  const { checklist, handleUploadDocument, actionLoading } = useDocsViewModel(id, isApp);
  const { showToast, agent, updateDoc } = useApp();

  const [file, setFile] = useState(null);
  const [remarks, setRemarks] = useState('Original document verified in person by sales agent');
  const [localLoading, setLocalLoading] = useState(false);

  // Find doc from live checklist or customer fallback
  let doc = null;
  let allowedFormats = null;
  if (checklist && checklist.length > 0) {
    if (docCode) {
      doc = checklist.find((d) => d.code === docCode);
    }
    if (!doc && !isNaN(index) && checklist[index]) {
      doc = checklist[index];
    }
    if (doc) {
      allowedFormats = doc.allowedMimes;
    }
  }

  if (!doc && customer) {
    const raw = customer.documents || customer.docs || [];
    if (docCode) {
      doc = raw.find((d) => (d.code || d.name) === docCode);
    }
    if (!doc && !isNaN(index) && raw[index]) {
      doc = raw[index];
    }
    if (doc) {
      const reqDoc = customer?.serviceSnapshot?.requiredDocuments?.find(
        (rd) => rd.code === doc.code
      );
      if (reqDoc) {
        allowedFormats = reqDoc.allowedMimes || reqDoc.allowedFormats;
      }
    }
  }

  const docName = doc?.name || doc?.code || 'Document';

  const customerName =
    customer?.userSnapshot?.fullName ||
    customer?.applicantName ||
    customer?.contactDetails?.fullName ||
    customer?.name ||
    '';

  async function choose() {
    try {
      const picked = await pickDocument(allowedFormats);
      if (!picked) return;
      setFile(picked);
    } catch {
      showToast('Could not open document picker');
    }
  }

  async function submit() {
    if (!doc) return;
    if (!file) {
      showToast('Please select a file to upload');
      return;
    }

    setLocalLoading(true);
    try {
      if (isApp) {
        // Read file as Base64 Data URL
        const { base64, size } = await readUriAsBase64(file.uri);

        const payload = {
          code: doc.code,
          file: base64,
          fileName: file.name,
          fileSize: size,
          mimeType: file.mime || 'application/octet-stream',
          remarks: remarks.trim() || 'Uploaded and verified by sales agent',
        };

        const success = await handleUploadDocument(payload);
        if (success) {
          navigation.goBack();
        }
      } else {
        // Local mock fallback for offline leads
        setTimeout(() => {
          updateDoc(id, index, {
            state: 'approved',
            uploadedBy: 'agent',
            reason: `Uploaded by ${agent.name} · ${file.name}`,
          });
          showToast(`${docName} uploaded for ${customer.name}`);
          setLocalLoading(false);
          navigation.goBack();
        }, 800);
        return;
      }
    } catch (err) {
      console.error('File reading / upload error:', err);
      showToast('Error processing file for upload');
    } finally {
      setLocalLoading(false);
    }
  }

  const isImage = file?.mime?.startsWith('image/');
  const isPdf = file?.mime?.includes('pdf') || file?.name?.toLowerCase().endsWith('.pdf');

  return (
    <>
      <Screen>
        <Header
          title="Upload Document"
          subtitle={docName}
          onBack={() => navigation.goBack()}
        />

        {/* Auto-Verification Callout Banner */}
        <View style={styles.autoVerifyBanner}>
          <View style={styles.autoVerifyIcon}>
            <CheckCircleIcon size={18} color="#15803D" strokeWidth={2.2} />
          </View>
          <View style={styles.autoVerifyContent}>
            <Text style={styles.autoVerifyTitle}>Instant Agent Verification</Text>
            <Text style={styles.autoVerifyText}>
              Documents uploaded by sales agents are verified instantly and added to compliance.
            </Text>
          </View>
        </View>

        {/* Document Target Card */}
        <View style={styles.docInfoCard}>
          <View style={styles.docInfoRow}>
            <View style={styles.docIconWrap}>
              <FileTextIcon size={22} color={colors.tealDeep} />
            </View>
            <View style={styles.docInfoMeta}>
              <Text style={styles.docInfoName} numberOfLines={2}>
                {docName}
              </Text>
              {customerName ? (
                <Text style={styles.docCustomerName}>For {customerName}</Text>
              ) : null}
            </View>
            {doc?.isMandatory !== false && (
              <Chip label="MANDATORY" tone={{ bg: '#FEE2E2', fg: '#B91C1C' }} />
            )}
          </View>
        </View>

        {/* File Picker / Selected Preview */}
        {!file ? (
          <Pressable
            onPress={choose}
            style={({ pressed }) => [
              styles.pickerBox,
              pressed && styles.pickerBoxPressed,
            ]}
          >
            <View style={styles.pickerCircle}>
              <UploadCloudIcon size={30} color={colors.tealDeep} strokeWidth={2} />
            </View>
            <Text style={styles.pickerMainText}>Choose Document File</Text>
            <Text style={styles.pickerSubText}>
              Select clear image (JPG, PNG) or PDF document
            </Text>
            <View style={styles.pickerBrowsePill}>
              <Text style={styles.pickerBrowsePillText}>Browse Files</Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.selectedFileCard}>
            <View style={styles.selectedFileHeader}>
              <View style={styles.selectedFileLeft}>
                <View style={isPdf ? styles.pdfIconCircle : styles.imgIconCircle}>
                  <FileTextIcon size={22} color={isPdf ? '#DC2626' : colors.tealDeep} />
                </View>
                <View style={styles.selectedFileMeta}>
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.selectedFileType}>
                    {isPdf ? 'PDF Document' : 'Image Photo'} · Ready to upload
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={choose}
                style={({ pressed }) => [
                  styles.changeFileBtn,
                  pressed && styles.pressedOpacity,
                ]}
              >
                <Text style={styles.changeFileBtnText}>Change</Text>
              </Pressable>
            </View>

            {isImage ? (
              <View style={styles.imagePreviewWrap}>
                <Image
                  source={{ uri: file.uri }}
                  style={styles.imagePreview}
                  resizeMode="contain"
                />
              </View>
            ) : null}
          </View>
        )}

        {/* Agent Verification Remark */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Agent Verification Remark</Text>
          <TextInput
            value={remarks}
            onChangeText={setRemarks}
            placeholder="e.g. Original physical document verified in person"
            placeholderTextColor="#94A3B8"
            style={styles.textInput}
          />
          <Text style={styles.inputHint}>
            This remark is recorded in the customer compliance audit trail.
          </Text>
        </View>

        {/* Primary Action Button */}
        <View style={styles.submitSection}>
          <Pressable
            onPress={submit}
            disabled={!file || actionLoading || localLoading}
            style={({ pressed }) => [
              styles.submitBtn,
              !file && styles.submitBtnDisabled,
              pressed && styles.pressedOpacity,
            ]}
          >
            <CheckCircleIcon size={18} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={styles.submitBtnText}>
              {actionLoading || localLoading
                ? 'Uploading & Verifying...'
                : 'Upload & Verify Document'}
            </Text>
          </Pressable>
        </View>
      </Screen>

      <LoaderOverlay visible={actionLoading || localLoading} />
    </>
  );
}

const styles = StyleSheet.create({
  autoVerifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginVertical: 10,
  },
  autoVerifyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoVerifyContent: {
    flex: 1,
  },
  autoVerifyTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#15803D',
  },
  autoVerifyText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11.5,
    color: '#166534',
    marginTop: 2,
    lineHeight: 16,
  },
  docInfoCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  docInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  docIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfoMeta: {
    flex: 1,
  },
  docInfoName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: colors.navy,
  },
  docCustomerName: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  pickerBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  pickerBoxPressed: {
    backgroundColor: '#F1F5F9',
    borderColor: colors.teal,
  },
  pickerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  pickerMainText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: colors.navy,
  },
  pickerSubText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  pickerBrowsePill: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pickerBrowsePillText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.tealDeep,
  },
  selectedFileCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  selectedFileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedFileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pdfIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFileMeta: {
    flex: 1,
  },
  selectedFileName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: colors.navy,
  },
  selectedFileType: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
  },
  changeFileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  changeFileBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.navy,
  },
  imagePreviewWrap: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.line,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  inputCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12.5,
    color: colors.navy,
    marginBottom: 8,
  },
  textInput: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: colors.ink,
    backgroundColor: '#F8FAFC',
  },
  inputHint: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: colors.muted,
    marginTop: 6,
  },
  submitSection: {
    marginBottom: 32,
  },
  submitBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0284C7',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  pressedOpacity: {
    opacity: 0.85,
  },
});

