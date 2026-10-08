import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip, Header, Screen } from '../components/ui';
import { useCustomer } from '../store';
import { colors, type } from '../theme';

export default function AgentDocsScreen({ navigation, route }) {
  const id = route.params?.id;
  const customer = useCustomer(id);
  const pending = customer?.docs.map((doc, index) => ({ doc, index })).filter((item) => item.doc.state === 'pending') || [];

  return (
    <Screen>
      <Header title="Upload for this user" subtitle={customer ? `${customer.name} · ${customer.app}` : 'Lead'} />
      <Text style={[type.muted, { marginVertical: 12 }]}>
        These files were not uploaded. The user asked you to verify and upload them on this application.
      </Text>
      <View style={styles.card}>
        {pending.length === 0 ? <Text style={[type.muted, { paddingVertical: 12 }]}>Nothing left. Every pending file for this user is uploaded.</Text> : null}
        {pending.map(({ doc, index }, row) => (
          <Pressable
            key={`${doc.name}-${index}`}
            onPress={() => navigation.navigate('AgentUpload', { id, index: String(index), back: 'AgentDocs' })}
            style={[styles.doc, row < pending.length - 1 && styles.border]}
          >
            <View style={styles.mark}>
              <Text>📄</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.title}>{doc.name}</Text>
              <Text style={type.muted}>{customer.name} could not upload this</Text>
            </View>
            <Chip label="Asked agent" tone={{ bg: colors.redSoft, fg: colors.red }} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    paddingHorizontal: 14,
  },
  doc: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.line },
  mark: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.tealSoft, alignItems: 'center', justifyContent: 'center' },
});
