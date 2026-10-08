import Clipboard from '@react-native-clipboard/clipboard';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { CopyIcon } from '../components/Icons';
import { Btn, Card, Field, Header, PhoneInput, Screen } from '../components/ui';
import { AGENT, shareMessage } from '../data';
import { useApp } from '../store';
import { colors, type } from '../theme';

export default function ShareScreen() {
  const { showToast } = useApp();
  const [mobile, setMobile] = useState('');

  function copyLink() {
    Clipboard.setString(AGENT.link);
    showToast('Link copied');
  }

  async function sendWhatsApp() {
    const digits = mobile.replace(/\D/g, '');
    if (digits && digits.length !== 10) {
      showToast('Enter a 10-digit mobile, or leave it blank');
      return;
    }
    const who = digits ? `+91 ${digits}` : 'any user';
    const base = digits ? `https://wa.me/91${digits}` : 'https://wa.me/';
    const url = `${base}?text=${encodeURIComponent(shareMessage())}`;
    try {
      await Linking.openURL(url);
      showToast(`WhatsApp opened for ${who} with code ${AGENT.code}`);
    } catch {
      showToast('WhatsApp is not available on this device');
    }
  }

  return (
    <Screen>
      <Header title="User app link" />
      <Text style={[type.muted, { marginVertical: 12 }]}>
        This is your agent link. It opens the user app with your agent code.
      </Text>
      <Card style={{ alignItems: 'center', paddingVertical: 18 }}>
        <Text style={type.muted}>Agent code</Text>
        <Text style={styles.code}>{AGENT.code}</Text>
        <Text style={[type.muted, { marginTop: 6 }]}>Already included in the user app link</Text>
      </Card>
      <View style={{ height: 14 }} />
      <Field label="User app link">
        <View style={styles.linkRow}>
          <View style={styles.linkBox}>
            <Text style={styles.linkText}>{AGENT.link}</Text>
          </View>
          <Pressable onPress={copyLink} style={styles.copy}>
            <CopyIcon />
          </Pressable>
        </View>
      </Field>
      <Btn label="Copy link" onPress={copyLink} />
      <View style={{ height: 16 }} />
      <Field label="Mobile number">
        <PhoneInput value={mobile} onChangeText={(value) => setMobile(value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile" />
      </Field>
      <Card style={{ marginBottom: 12 }}>
        <Text style={type.muted}>Message</Text>
        <Text style={[styles.message, { marginTop: 8 }]}>{shareMessage()}</Text>
      </Card>
      <Btn label="WhatsApp" onPress={sendWhatsApp} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  code: { fontFamily: 'Fraunces-Bold', fontSize: 30, color: colors.navy, marginTop: 4 },
  linkRow: { flexDirection: 'row', gap: 8 },
  linkBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#B7C6D4',
    borderRadius: 14,
    padding: 12,
    justifyContent: 'center',
  },
  linkText: { fontFamily: 'DMSans-Bold', fontSize: 13, color: colors.navy },
  copy: { width: 48, borderRadius: 14, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  message: { fontFamily: 'DMSans-Medium', fontSize: 13, lineHeight: 20, color: colors.navy },
});
