import Clipboard from '@react-native-clipboard/clipboard';
import LinearGradient from 'react-native-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CopyIcon } from '../components/Icons';
import { Btn, Card, Chip, Field, Screen, ListShimmer } from '../components/ui';
import { AGENT } from '../data';
import { useApp } from '../store';
import { colors, type } from '../theme';
import { ApiService } from '../network/ApiService';
import { useProfileViewModel } from '../viewmodels/ProfileViewModel';
import messaging from '@react-native-firebase/messaging';

export default function ProfileScreen({ navigation }) {
  const { showToast, token, refreshToken, setTokens } = useApp();
  const { profile, loading } = useProfileViewModel();

  function copyLink() {
    Clipboard.setString(AGENT.link);
    showToast('Link copied');
  }

  async function logout() {
    try {
      if (token && refreshToken) {
        try {
          if (messaging) {
            const deviceToken = await messaging().getToken();
            if (deviceToken) {
              await ApiService.unregisterDeviceToken(token, deviceToken);
            }
          }
        } catch (messagingError) {
          console.warn('Failed to unregister device token:', messagingError);
        }
        await ApiService.logout(token, refreshToken);
      }
    } catch (e) {
      console.warn('Logout API failed', e);
    }
    await setTokens(null, null);
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Splash' }] });
  }

  if (loading) {
    return (
      <Screen tab>
        <Text style={type.h1}>Profile</Text>
        <ListShimmer />
      </Screen>
    );
  }

  const name = profile?.name || AGENT.name;
  const mobile = profile?.phoneNumber || AGENT.mobile;
  const email = profile?.email || AGENT.email;
  const code = profile?.agentCode || AGENT.code;
  const letter = name ? name[0].toUpperCase() : 'U';

  return (
    <Screen tab>
      <Text style={type.h1}>Profile</Text>
      <Text style={[type.muted, { marginTop: 4 }]}>Your salesperson account.</Text>
      <Card style={{ marginTop: 14, alignItems: 'center', paddingVertical: 22 }}>
        <LinearGradient colors={['#0077E6', '#FF5722']} style={styles.avatar}>
          <Text style={styles.letter}>{letter}</Text>
        </LinearGradient>
        <Text style={[type.h3, { marginTop: 10 }]}>{name}</Text>
        <Text style={type.muted}>Salesperson</Text>
        <View style={{ marginTop: 8 }}>
          <Chip label={code} />
        </View>
      </Card>
      <Card style={{ marginTop: 12 }}>
        <Row label="Mobile" value={mobile} />
        <Row label="Email" value={email} />
        <Row label="Agent code" value={code} />
        {profile?.metrics?.totalAssignedApplications !== undefined && (
          <Row label="Total applications" value={String(profile.metrics.totalAssignedApplications)} />
        )}
      </Card>
      <Field label="User app link" style={{ marginTop: 14 }}>
        <View style={styles.linkRow}>
          <View style={styles.linkBox}>
            <Text style={styles.linkText}>{AGENT.link}</Text>
          </View>
          <Pressable onPress={copyLink} style={styles.copy}>
            <CopyIcon />
          </Pressable>
        </View>
      </Field>
      <Btn label="Log out" variant="ghost" onPress={logout} />
    </Screen>
  );
}

function Row({ label, value, last }) {
  return (
    <View style={[styles.row, !last && { marginBottom: 10 }]}>
      <Text style={type.muted}>{label}</Text>
      <Text style={[type.title, { flexShrink: 1, textAlign: 'right' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  letter: { color: '#fff', fontFamily: 'DMSans-ExtraBold', fontSize: 26 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  linkRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
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
});
