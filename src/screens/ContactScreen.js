import { Linking, StyleSheet, Text, View } from 'react-native';
import { Btn, Header, Screen } from '../components/ui';
import { useApp, useCustomer } from '../store';
import { colors, type } from '../theme';

export default function ContactScreen({ route }) {
  const paramCustomer = route.params?.customer;
  const mockCustomer = useCustomer(route.params?.id);
  const customer = paramCustomer || mockCustomer;
  const { showToast } = useApp();

  const userSnapshot = customer?.userSnapshot || customer?.user || {};
  const name =
    userSnapshot.fullName ||
    userSnapshot.name ||
    customer?.applicantName ||
    customer?.name ||
    'Applicant';
  const mobile =
    userSnapshot.phoneNumber ||
    userSnapshot.phone ||
    customer?.applicantPhone ||
    customer?.mobile ||
    '';
  const email =
    userSnapshot.email ||
    customer?.email ||
    '';
  const letter = name ? name[0].toUpperCase() : 'A';

  async function call() {
    if (!mobile) return;
    try {
      await Linking.openURL(`tel:${mobile.replace(/[^\d+]/g, '')}`);
      showToast('Calling lead');
    } catch {
      showToast('Calling is not available on this device');
    }
  }

  async function whatsapp() {
    if (!mobile) return;
    const digits = mobile.replace(/\D/g, '');
    const text = encodeURIComponent(`Hello ${name}, this is Rahul from GMFL.`);
    try {
      await Linking.openURL(`https://wa.me/${digits}?text=${text}`);
      showToast('WhatsApp chat opened');
    } catch {
      showToast('WhatsApp is not available on this device');
    }
  }

  if (!customer) {
    return (
      <Screen>
        <Header title="Contact applicant" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Contact applicant" />
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.letter}>{letter}</Text>
        </View>
        <Text style={[type.h3, { marginTop: 10 }]}>{name}</Text>
        {mobile ? <Text style={type.muted}>{mobile}</Text> : null}
        {email ? <Text style={type.muted}>{email}</Text> : null}
      </View>
      <View style={styles.row}>
        <Btn label="Call" flex onPress={call} />
        <Btn label="WhatsApp" variant="ghost" flex onPress={whatsapp} />
      </View>
      <Text style={[type.muted, { marginTop: 12, textAlign: 'center' }]}>
        MVP contact only — no complex calling / chat system.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: { color: colors.tealDeep, fontFamily: 'DMSans-ExtraBold', fontSize: 22 },
  row: { flexDirection: 'row', gap: 10, marginTop: 14 },
});