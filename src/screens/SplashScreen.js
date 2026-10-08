import LinearGradient from 'react-native-linear-gradient';
import { StatusBar, StyleSheet, Text, View, Image } from 'react-native';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip } from '../components/ui';
import { useApp } from '../store';

export default function SplashScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { token, isReady } = useApp();

  useEffect(() => {
    if (!isReady) return;
    const timer = setTimeout(() => {
      if (token) {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        navigation.navigate('Login');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation, token, isReady]);

  return (
    <LinearGradient
      colors={['#040914', '#0B192C', '#004BB5', '#E64A19']}
      locations={[0, 0.45, 0.82, 1]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={[styles.screen, { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 28 }]}
    >
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Chip label="Salesperson workspace" tone={{ bg: 'rgba(255,255,255,0.16)', fg: '#fff' }} />
        <Image source={require('../assets/logo.jpg')} style={styles.logo} />
        <Text style={styles.brand}>GMFL</Text>
        <Text style={[styles.tag, { textAlign: 'center' }]}>Manage · Review · Update · Complete</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginTop: 28,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    resizeMode: 'cover',
  },
  brand: { fontFamily: 'Fraunces-Bold', fontSize: 42, color: '#fff' },
  tag: { marginTop: 8, color: '#C9D7E6', fontFamily: 'DMSans-Medium', fontSize: 15 },
});
