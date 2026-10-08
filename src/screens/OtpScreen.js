import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { BackButton, Btn, Screen } from '../components/ui';
import { DEMO_OTP } from '../data';
import { useApp } from '../store';
import { colors, type } from '../theme';

export default function OtpScreen({ navigation, route }) {
  const phone = route.params?.mobile || '9810010240';
  const pretty = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
  const { showToast } = useApp();
  const [digits, setDigits] = useState(DEMO_OTP.split(''));
  const refs = useRef([]);

  function setDigit(index, value) {
    const next = value.replace(/\D/g, '').slice(-1);
    const copy = [...digits];
    copy[index] = next;
    setDigits(copy);
    if (next && refs.current[index + 1]) refs.current[index + 1].focus();
  }

  function verify() {
    if (digits.join('') !== DEMO_OTP) {
      showToast('Demo OTP is 123456');
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  }

  return (
    <Screen>
      <BackButton />
      <View style={{ height: 18 }} />
      <Text style={type.h1}>Enter OTP</Text>
      <Text style={[type.muted, { marginTop: 6 }]}>6-digit code sent to WhatsApp on {pretty}</Text>
      <View style={styles.row}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(node) => {
              refs.current[index] = node;
            }}
            value={digit}
            onChangeText={(value) => setDigit(index, value)}
            keyboardType="number-pad"
            maxLength={1}
            style={styles.box}
            selectTextOnFocus
          />
        ))}
      </View>
      <Btn label="Verify & continue" onPress={verify} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 18 },
  box: {
    width: 48,
    height: 54,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'DMSans-ExtraBold',
    color: colors.navy,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
});
