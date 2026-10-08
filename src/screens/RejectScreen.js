import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { Btn, Field, Header, Screen, LoaderOverlay } from '../components/ui';
import { useApp, useCustomer } from '../store';
import { colors, type } from '../theme';

export default function RejectScreen({ navigation, route }) {
  const id = route.params?.id;
  const index = Number(route.params?.index);
  const isApp = route.params?.isApp || false;
  const customer = useCustomer(id);
  const doc = customer?.docs[index];
  const { updateDoc, showToast } = useApp();
  const [reason, setReason] = useState('Document is not clearly visible.');
  const [loading, setLoading] = useState(false);

  function send() {
    const text = reason.trim();
    if (!text) {
      showToast('Rejection reason is required');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      updateDoc(id, index, { state: 'rejected', reason: text });
      showToast(`${doc?.name || 'Document'} rejected`);
      setLoading(false);
      navigation.navigate('DocReview', { id, isApp });
    }, 800);
  }

  return (
    <>
      <Screen>
        <Header title="Rejection remark" />
      <Text style={[type.muted, { marginVertical: 12 }]}>
        Reason is required. The lead sees it and can upload the same document again.
      </Text>
      <Field label="Reason">
        <TextInput
          value={reason}
          onChangeText={setReason}
          multiline
          style={styles.area}
          placeholder="Write the reason"
          placeholderTextColor="#94A3B8"
        />
      </Field>
      <Btn label="Send rejection" variant="orange" onPress={send} />
    </Screen>
    <LoaderOverlay visible={loading} />
  </>
  );
}

const styles = StyleSheet.create({
  area: {
    height: 96,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.white,
  },
});
