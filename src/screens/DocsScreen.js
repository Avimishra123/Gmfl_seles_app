import { Text, View } from 'react-native';
import { Card, Chip, Screen } from '../components/ui';
import { useApp } from '../store';
import { chipColors, type } from '../theme';

function openLabel(customer) {
  const pending = customer.docs.filter((doc) => doc.state === 'pending').length;
  const review = customer.docs.filter((doc) => doc.state === 'review' || doc.state === 'rejected').length;
  if (pending && review) return { label: `${review} to review`, colors: chipColors('review') };
  if (pending) return { label: `${pending} pending`, colors: chipColors('pending') };
  if (review === 1) return { label: 'Under review', colors: chipColors('review') };
  if (review) return { label: `${review} to review`, colors: chipColors('review') };
  return null;
}

export default function DocsScreen({ navigation }) {
  const { customers } = useApp();
  const list = customers.filter((customer) => customer.line === 'loan' && openLabel(customer));

  return (
    <Screen tab>
      <Text style={type.h1}>Documents</Text>
      <Text style={[type.muted, { marginTop: 4 }]}>
        Review is explicit. If a user cannot upload, open their file and verify + upload it for them.
      </Text>
      <View style={{ height: 12 }} />
      {list.length === 0 ? <Text style={type.muted}>Nothing waiting for review.</Text> : null}
      {list.map((customer) => {
        const badge = openLabel(customer);
        const openDocs = customer.docs.filter((doc) => doc.state !== 'approved').map((doc) => doc.name);
        return (
          <Card
            key={customer.id}
            style={{ marginBottom: 10 }}
            onPress={() => navigation.navigate('DocReview', { id: customer.id })}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <Text style={[type.title, { flex: 1 }]}>{customer.name}</Text>
              <Chip label={badge.label} tone={badge.colors} />
            </View>
            <Text style={[type.muted, { marginTop: 6 }]}>
              {customer.product} · {openDocs.slice(0, 2).join(' + ')}
            </Text>
          </Card>
        );
      })}
    </Screen>
  );
}
