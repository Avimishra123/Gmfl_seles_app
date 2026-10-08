import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Keyboard, Platform, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { ChevronRightIcon } from './Icons';
import { chipColors, colors, type } from '../theme';
export function Screen({ children, tab = false, onRefresh, refreshing = false, onEndReached }) {
  const insets = useSafeAreaInsets();

  const handleScroll = (event) => {
    if (!onEndReached) return;
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    // Trigger when user has scrolled down and is within 180px of the bottom
    const isCloseToBottom =
      contentOffset.y > 20 &&
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 180;
    if (isCloseToBottom) {
      onEndReached();
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScroll={onEndReached ? handleScroll : undefined}
        scrollEventThrottle={16}
        refreshControl={
          onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.teal]} tintColor={colors.teal} /> : undefined
        }
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 18,
          paddingBottom: (tab ? 138 : 40) + insets.bottom,
        }}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function BackButton({ onPress }) {
  const navigation = useNavigation();
  return (
    <Pressable onPress={onPress || (() => navigation.goBack())} style={styles.back} hitSlop={8}>
      <Text style={styles.backText}>←</Text>
    </Pressable>
  );
}

export function Header({ title, subtitle, onBack }) {
  return (
    <View style={styles.header}>
      <BackButton onPress={onBack} />
      <View style={{ flex: 1 }}>
        <Text style={type.title}>{title}</Text>
        {subtitle ? <Text style={type.muted}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export function Chip({ label, tone }) {
  const palette = tone || chipColors(label);
  return (
    <View style={[styles.chip, { backgroundColor: palette.bg }]}>
      <Text style={[styles.chipText, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

export function Btn({ label, onPress, variant = 'primary', flex = false }) {
  const ghost = variant === 'ghost' || variant === 'danger';
  const text = (
    <Text
      numberOfLines={1}
      style={[
        styles.btnText,
        flex && { fontSize: 14 },
        variant === 'ghost' && { color: colors.navy },
        variant === 'danger' && { color: colors.red },
      ]}
    >
      {label}
    </Text>
  );

  if (ghost) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.ghost,
          variant === 'danger' && styles.danger,
          flex && styles.flex,
          pressed && { opacity: 0.85 },
        ]}
      >
        {text}
      </Pressable>
    );
  }

  const gradient = variant === 'orange' ? ['#FF6B35', '#E63946'] : ['#0077E6', '#0055C4'];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btnShadow, flex && styles.flex, pressed && { opacity: 0.92 }]}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
        {text}
      </LinearGradient>
    </Pressable>
  );
}

export function Card({ children, style, onPress }) {
  const body = <View style={[styles.card, style]}>{children}</View>;
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.92 }}>
      {body}
    </Pressable>
  );
}

export function Field({ label, children, style }) {
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      <Text style={type.label}>{label}</Text>
      {children}
    </View>
  );
}

export function Input({ style, ...props }) {
  return <TextInput placeholderTextColor="#94A3B8" style={[styles.input, style]} {...props} />;
}

export function PhoneInput({ value, onChangeText, placeholder }) {
  return (
    <View style={styles.phoneRow}>
      <View style={styles.cc}>
        <Text style={styles.ccText}>+91</Text>
      </View>
      <Input
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        maxLength={10}
        placeholder={placeholder}
        style={{ flex: 1 }}
      />
    </View>
  );
}

export function Avatar({ letter, bg = colors.tealSoft, fg = colors.tealDeep, size = 44 }) {
  return (
    <View style={[styles.avatar, { backgroundColor: bg, width: size, height: size, borderRadius: size * 0.32 }]}>
      <Text style={{ color: fg, fontFamily: 'DMSans-ExtraBold', fontSize: size * 0.38 }}>{letter}</Text>
    </View>
  );
}

export function Segment({ options, value, onChange }) {
  return (
    <View style={styles.seg}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <Pressable key={option.value} onPress={() => onChange(option.value)} style={[styles.segBtn, on && styles.segOn]}>
            <Text style={[styles.segText, on && styles.segTextOn]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function PersonRow({ letter, name, meta, chip, onPress, iconBg, iconFg }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.person, pressed && { opacity: 0.92 }]}>
      <Avatar letter={letter} bg={iconBg} fg={iconFg} />
      <View style={{ flex: 1 }}>
        <Text style={type.title}>{name}</Text>
        {meta ? <Text style={[type.muted, { marginTop: 2 }]}>{meta}</Text> : null}
      </View>
      {chip}
    </Pressable>
  );
}

export function ActionRow({ icon, title, subtitle, onPress, trailing }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && { opacity: 0.92 }]}>
      <View style={[styles.avatar, { backgroundColor: icon.bg, width: 42, height: 42, borderRadius: 12 }]}>
        {icon.node}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={type.title}>{title}</Text>
        <Text style={type.muted}>{subtitle}</Text>
      </View>
      {trailing !== undefined ? (
        typeof trailing === 'string' ? (
          <Text style={styles.chevron}>{trailing}</Text>
        ) : (
          trailing
        )
      ) : (
        <ChevronRightIcon size={18} color="#94A3B8" />
      )}
    </Pressable>
  );
}

export function Toast({ message }) {
  const insets = useSafeAreaInsets();
  const [kb, setKb] = useState(0);

  useEffect(() => {
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const sub1 = Keyboard.addListener(show, (e) => setKb(e.endCoordinates.height));
    const sub2 = Keyboard.addListener(hide, () => setKb(0));
    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  if (!message) return null;
  return (
    <View pointerEvents="none" style={[styles.toastWrap, { bottom: insets.bottom + 96 + kb }]}>
      <View style={styles.toast}>
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </View>
  );
}

export function Shimmer({ style }) {
  const [opacity] = useState(new Animated.Value(0.3));

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return <Animated.View style={[{ backgroundColor: '#E2E8F0', borderRadius: 8 }, style, { opacity }]} />;
}

export function ListShimmer() {
  return (
    <View style={{ gap: 8, marginTop: 16 }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12, padding: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 16 }}>
          <Shimmer style={{ width: 44, height: 44, borderRadius: 14 }} />
          <View style={{ flex: 1, justifyContent: 'center', gap: 6 }}>
            <Shimmer style={{ width: i === 2 ? '50%' : '60%', height: 16 }} />
            <Shimmer style={{ width: i === 1 ? '40%' : '70%', height: 12 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function LoaderOverlay({ visible }) {
  if (!visible) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16 }}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  back: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 18, color: colors.navy, fontFamily: 'DMSans-Bold' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  chip: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  chipText: { fontFamily: 'DMSans-Bold', fontSize: 11 },
  btnShadow: {
    borderRadius: 16,
    shadowColor: '#0077E6',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  btn: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  btnText: { color: '#fff', fontFamily: 'DMSans-ExtraBold', fontSize: 16 },
  ghost: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
  },
  danger: { borderColor: '#FECACA' },
  flex: { flex: 1 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 14,
    shadowColor: '#0C1F33',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    color: colors.ink,
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
  },
  phoneRow: { flexDirection: 'row', gap: 8 },
  cc: {
    width: 78,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ccText: { fontFamily: 'DMSans-Bold', fontSize: 14, color: colors.ink },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  seg: { flexDirection: 'row', backgroundColor: '#EAF0F6', padding: 4, borderRadius: 14, marginVertical: 12 },
  segBtn: { flex: 1, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.white, shadowColor: '#0C1F33', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  segText: { fontFamily: 'DMSans-Bold', fontSize: 12, color: colors.muted },
  segTextOn: { color: colors.navy },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    marginBottom: 8,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 8,
  },
  chevron: { fontSize: 22, color: colors.muted, fontFamily: 'DMSans-Medium' },
  toastWrap: { position: 'absolute', left: 18, right: 18 },
  toast: { backgroundColor: colors.navy, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  toastText: { color: '#fff', fontFamily: 'DMSans-SemiBold', fontSize: 13 },
});
