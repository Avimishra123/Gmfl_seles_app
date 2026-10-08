import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Card, Chip, Screen, Segment } from '../components/ui';
import { useApp } from '../store';
import { type } from '../theme';

const FILTERS = {
  review: ['Documents Pending', 'Documents Under Review', 'Documents Rejected'],
  process: ['Under Process', 'Submitted'],
  done: ['Approved', 'Completed'],
};

export default function AppsScreen({ navigation }) {
  const { customers } = useApp();
  const [filter, setFilter] = useState('all');
  const list = useMemo(() => {
    if (filter === 'all') return customers;
    return customers.filter((customer) => (FILTERS[filter] || []).includes(customer.status));
  }, [customers, filter]);

  return (
    <Screen tab>
      <Text style={type.h1}>Applications</Text>
      <Text style={[type.muted, { marginTop: 4 }]}>Assigned queue only — not all users on the platform.</Text>
      <Segment
        value={filter}
        onChange={setFilter}
        options={[
          { label: 'All', value: 'all' },
          { label: 'Review', value: 'review' },
          { label: 'Process', value: 'process' },
          { label: 'Done', value: 'done' },
        ]}
      />
      {list.map((customer) => (
        <Card key={customer.id} style={{ marginBottom: 10 }} onPress={() => navigation.navigate('Customer', { id: customer.id })}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <Text style={[type.title, { flex: 1 }]}>{customer.product}</Text>
            <Chip label={customer.status} />
          </View>
          <Text style={[type.muted, { marginTop: 6 }]}>
            {customer.name} · {customer.app} · {customer.date}
          </Text>
        </Card>
      ))}
    </Screen>
  );
}
