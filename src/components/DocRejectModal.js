import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Btn } from './ui';
import { colors, type } from '../theme';

const QUICK_DOC_REASONS = [
  'Blurry or unreadable image',
  'Document expired or invalid date',
  'Name mismatch with application',
  'Edges cropped / incomplete page',
  'Incorrect document type uploaded',
  'Signature or stamp missing',
];

export function DocRejectModal({ visible, doc, onClose, onConfirm, loading = false }) {
  const [remarks, setRemarks] = useState('');

  function handleSelectTag(tag) {
    setRemarks(tag);
  }

  function handleConfirm() {
    if (remarks.trim().length < 5) return;
    onConfirm(remarks.trim());
  }

  const isValid = remarks.trim().length >= 5;
  const docName = doc?.name || doc?.code || 'Document';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handleBar} />
          <Text style={styles.title}>Reject {docName}</Text>
          <Text style={type.muted}>
            State why this document cannot be accepted. The applicant will see this note to upload a valid replacement.
          </Text>

          <Text style={[type.label, { marginTop: 14 }]}>Quick Reasons</Text>
          <View style={styles.chipsRow}>
            {QUICK_DOC_REASONS.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => handleSelectTag(tag)}
                style={[styles.tag, remarks === tag && styles.tagSelected]}
              >
                <Text style={[styles.tagText, remarks === tag && styles.tagTextSelected]}>
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[type.label, { marginTop: 12 }]}>Rejection Reason (Required)</Text>
          <TextInput
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Explain why this document is rejected (min 5 characters)..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            style={styles.inputArea}
          />
          <View style={styles.counterRow}>
            <Text
              style={[
                styles.counterText,
                isValid ? { color: colors.greenText } : { color: colors.red },
              ]}
            >
              {remarks.trim().length}/5 characters minimum
            </Text>
          </View>

          <View style={styles.btnRow}>
            <Btn label="Cancel" variant="ghost" flex onPress={onClose} />
            <Btn
              label={loading ? 'Rejecting...' : 'Reject Document'}
              variant="danger"
              flex
              onPress={handleConfirm}
              disabled={!isValid || loading}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.line,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: 'Fraunces-Bold',
    fontSize: 20,
    color: colors.navy,
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagSelected: {
    backgroundColor: colors.redSoft,
    borderColor: colors.red,
  },
  tagText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: colors.navy,
  },
  tagTextSelected: {
    color: colors.red,
    fontFamily: 'DMSans-Bold',
  },
  inputArea: {
    height: 80,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.white,
    marginTop: 4,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    marginBottom: 16,
  },
  counterText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
