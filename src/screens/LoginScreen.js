import { Text, View, Pressable } from 'react-native';
import { BackButton, Btn, Chip, Field, Input, Screen, LoaderOverlay } from '../components/ui';
import { EyeIcon, EyeOffIcon } from '../components/Icons';
import { type } from '../theme';
import { useLoginViewModel } from '../viewmodels/LoginViewModel';

export default function LoginScreen({ navigation }) {
  const {
    username,
    setUsername,
    password,
    setPassword,
    loading,
    handleLogin,
    showPassword,
    togglePassword,
  } = useLoginViewModel(navigation);

  return (
    <>
      <Screen>
        <BackButton />
      <View style={{ height: 18 }} />
      <Chip label="Secure login" />
      <Text style={[type.h1, { marginTop: 10, marginBottom: 8 }]}>Salesperson login</Text>
      <Text style={type.muted}>Operational access for assigned leads and document review.</Text>
      <View style={{ height: 22 }} />
      <Field label="Username">
        <Input 
          value={username} 
          onChangeText={setUsername} 
          placeholder="Enter username" 
          autoCapitalize="none" 
        />
      </Field>
      <Field label="Password">
        <View style={{ position: 'relative' }}>
          <Input 
            value={password} 
            onChangeText={setPassword} 
            placeholder="Enter password" 
            secureTextEntry={!showPassword} 
            style={{ paddingRight: 40 }}
          />
          <Pressable 
            onPress={togglePassword} 
            style={{ position: 'absolute', right: 12, top: 14, zIndex: 10 }}
            hitSlop={12}
          >
            {showPassword ? <EyeOffIcon size={20} color="#94A3B8" /> : <EyeIcon size={20} color="#94A3B8" />}
          </Pressable>
        </View>
      </Field>
      <Btn label={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} variant="orange" />
      <Text style={[type.muted, { marginTop: 14, textAlign: 'center' }]}>Use provided credentials to login</Text>
    </Screen>
    <LoaderOverlay visible={loading} />
  </>
  );
}
