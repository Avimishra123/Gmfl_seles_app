import Clipboard from '@react-native-clipboard/clipboard';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Btn, Chip } from './ui';
import { PhoneIcon, CopyIcon, MessageSquareIcon, MailIcon } from './Icons';
import { colors, type } from '../theme';

export function ContactModal({ visible, onClose, customer, onShowToast }) {
  if (!customer) return null;

  const user = customer?.userSnapshot || customer?.user || {};
  const name =
    user.fullName ||
    user.name ||
    customer?.applicantName ||
    customer?.name ||
    'Applicant';
  const mobile =
    user.phoneNumber ||
    user.phone ||
    customer?.applicantPhone ||
    customer?.mobile ||
    '';
  const email =
    user.email ||
    customer?.contactDetails?.email ||
    customer?.email ||
    '';
  const digits = mobile.replace(/\D/g, '');
  const product =
    customer?.serviceSnapshot?.name || customer?.serviceName || customer?.product || 'application';
  const trackingId = customer?.trackingId || customer?.app || '';

  const TEMPLATES = [
    {
      title: 'General Greeting',
      desc: 'Introduce yourself regarding their file',
      text: `Hello ${name}, this is Rahul Sharma from GMFL regarding your ${product} application (${trackingId}). How can I assist you today?`,
    },
    {
      title: 'Pending Documents Reminder',
      desc: 'Prompt user to upload missing documents',
      text: `Hello ${name}, we need a few pending documents to process your ${product} application on GMFL. Please upload them on the app or reply here with clear photos.`,
    },
    {
      title: 'Application Approved',
      desc: 'Notify applicant of loan approval',
      text: `Congratulations ${name}! Your application for ${product} has been successfully approved by GMFL. Our team will contact you for disbursement.`,
    },
    {
      title: 'Quick Call Request',
      desc: 'Ask user for a convenient call time',
      text: `Hello ${name}, I am following up on your ${product} application. Please let me know a convenient time to speak for 2 minutes.`,
    },
  ];

  async function handleCall() {
    if (!mobile) return;
    try {
      await Linking.openURL(`tel:${digits}`);
      onShowToast?.('Opening phone dialer...');
    } catch {
      onShowToast?.('Calling is not available on this device');
    }
  }

  async function handleWhatsApp(msg) {
    if (!mobile) return;
    const url = `https://wa.me/91${digits}?text=${encodeURIComponent(msg)}`;
    try {
      await Linking.openURL(url);
      onShowToast?.('Opening WhatsApp chat...');
    } catch {
      onShowToast?.('WhatsApp is not available on this device');
    }
  }

  async function handleSms(msg) {
    if (!mobile) return;
    const url = `sms:${digits}${msg ? `?body=${encodeURIComponent(msg)}` : ''}`;
    try {
      await Linking.openURL(url);
      onShowToast?.('Opening messaging app...');
    } catch {
      onShowToast?.('SMS is not available on this device');
    }
  }

  function copyPhone() {
    if (!mobile) return;
    Clipboard.setString(mobile);
    onShowToast?.('Mobile number copied to clipboard');
  }

  function copyEmail() {
    if (!email) return;
    Clipboard.setString(email);
    onShowToast?.('Email address copied to clipboard');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <View style={styles.flexOne}>
              <Text style={styles.title}>Contact {name}</Text>
              <Text style={type.muted}>{mobile || 'No phone recorded'}</Text>
            </View>
            <Pressable onPress={copyPhone} style={styles.iconBtn}>
              <CopyIcon color={colors.navy} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Quick Actions Grid */}
            <View style={styles.quickGrid}>
              <Pressable onPress={handleCall} style={[styles.quickCard, styles.cardGreen]}>
                <View style={styles.iconCircle}>
                  <PhoneIcon size={18} color={colors.greenText} />
                </View>
                <Text style={styles.quickTitle}>Call</Text>
                <Text style={styles.quickSub}>Direct dial</Text>
              </Pressable>

              <Pressable
                onPress={() => handleWhatsApp(TEMPLATES[0].text)}
                style={[styles.quickCard, styles.cardTeal]}
              >
                <View style={styles.iconCircle}>
                  <MessageSquareIcon size={18} color={colors.tealDeep} />
                </View>
                <Text style={styles.quickTitle}>WhatsApp</Text>
                <Text style={styles.quickSub}>Chat now</Text>
              </Pressable>

              <Pressable
                onPress={() => handleSms(TEMPLATES[0].text)}
                style={[styles.quickCard, styles.cardSlate]}
              >
                <View style={styles.iconCircle}>
                  <MailIcon size={18} color={colors.navy} />
                </View>
                <Text style={styles.quickTitle}>SMS</Text>
                <Text style={styles.quickSub}>Text message</Text>
              </Pressable>
            </View>

            {/* Email Row if available */}
            {email ? (
              <View style={styles.emailRow}>
                <View style={styles.flexOne}>
                  <Text style={type.tiny}>APPLICANT EMAIL</Text>
                  <Text style={styles.emailText}>{email}</Text>
                </View>
                <Pressable onPress={copyEmail} style={styles.copyPill}>
                  <Text style={styles.copyPillText}>Copy</Text>
                </Pressable>
              </View>
            ) : null}

            {/* WhatsApp Pre-written Templates */}
            <Text style={[type.label, styles.templatesLabel]}>
              WhatsApp Smart Templates (One-Tap Send)
            </Text>
            {TEMPLATES.map((tpl, i) => (
              <Pressable
                key={i}
                onPress={() => handleWhatsApp(tpl.text)}
                style={({ pressed }) => [styles.templateCard, pressed && styles.pressedOpacity]}
              >
                <View style={styles.templateHeader}>
                  <Text style={styles.templateTitle}>{tpl.title}</Text>
                  <Chip label="Send ›" tone={{ bg: colors.greenSoft, fg: colors.greenText }} />
                </View>
                <Text style={styles.templateDesc}>{tpl.desc}</Text>
                <Text numberOfLines={2} style={styles.templateSnippet}>
                  "{tpl.text}"
                </Text>
              </Pressable>
            ))}
            <View style={styles.bottomSpacer} />
          </ScrollView>

          <Btn label="Close" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  scrollArea: {
    maxHeight: 420,
  },
  cardGreen: {
    backgroundColor: colors.greenSoft,
  },
  cardTeal: {
    backgroundColor: colors.tealSoft,
  },
  cardSlate: {
    backgroundColor: '#F1F5F9',
  },
  emailText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: colors.navy,
    marginTop: 2,
  },
  templatesLabel: {
    marginTop: 16,
    marginBottom: 8,
  },
  bottomSpacer: {
    height: 16,
  },
  pressedOpacity: {
    opacity: 0.85,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
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
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.line,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Fraunces-Bold',
    fontSize: 20,
    color: colors.navy,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  quickCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: colors.navy,
  },
  quickSub: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    color: colors.muted,
    marginTop: 1,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
  },
  copyPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  copyPillText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.navy,
  },
  templateCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 8,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  templateTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: colors.navy,
  },
  templateDesc: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: colors.muted,
    marginBottom: 6,
  },
  templateSnippet: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: colors.ink,
    fontStyle: 'italic',
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
});
