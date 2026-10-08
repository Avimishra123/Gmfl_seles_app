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

const QUICK_LEAD_REASONS = [
  'Customer not interested',
  'Already purchased elsewhere',
  'Invalid contact number',
  'Budget or eligibility issue',
  'Looking for different product',
  'Did not respond after multiple calls',
];

export function DropLeadModal({ visible, onClose, onConfirm, loading = false }) {
  const [remarks, setRemarks] = useState('');

  function handleSelectTag(tag) {
    setRemarks(tag);
  }

  function handleConfirm() {
    if (remarks.trim().length < 5) return;
    onConfirm(remarks.trim());
  }

  const isValid = remarks.trim().length >= 5;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handleBar} />
          <Text style={styles.title}>Drop Lead</Text>
          <Text style={type.muted}>
            Please specify why this lead cannot be converted. This reason is logged in the lead history.
          </Text>

          <Text style={[type.label, styles.quickLabel]}>Quick Reasons</Text>
          <View style={styles.chipsRow}>
            {QUICK_LEAD_REASONS.map((tag) => (
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

          <Text style={[type.label, styles.reasonLabel]}>Reason for Dropping (Required)</Text>
          <TextInput
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Explain why this lead is being dropped (min 5 characters)..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            style={styles.inputArea}
          />
          <View style={styles.counterRow}>
            <Text
              style={[
                styles.counterText,
                isValid ? styles.counterValid : styles.counterInvalid,
              ]}
            >
              {remarks.trim().length}/5 characters minimum
            </Text>
          </View>

          <View style={styles.btnRow}>
            <Btn label="Cancel" variant="ghost" flex onPress={onClose} />
            <Btn
              label={loading ? 'Dropping...' : 'Confirm Drop'}
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
    shadowRadius: 10,
    elevation: 8,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: colors.navy,
    marginBottom: 4,
  },
  quickLabel: {
    marginTop: 14,
  },
  reasonLabel: {
    marginTop: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  tag: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagSelected: {
    backgroundColor: '#FEE2E2',
    borderColor: colors.red,
  },
  tagText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: colors.ink,
  },
  tagTextSelected: {
    fontFamily: 'DMSans-Bold',
    color: colors.red,
  },
  inputArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: colors.ink,
    textAlignVertical: 'top',
    minHeight: 76,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    marginBottom: 16,
  },
  counterText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
  },
  counterValid: {
    color: colors.greenText,
  },
  counterInvalid: {
    color: colors.red,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
