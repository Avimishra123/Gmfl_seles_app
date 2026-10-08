import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Btn, Header, Screen, LoaderOverlay } from '../components/ui';
import { STATUSES } from '../data';
import { useApp, useCustomer } from '../store';
import { ApiService } from '../network/ApiService';
import { colors, type } from '../theme';

export default function StatusScreen({ navigation, route }) {
  const id = route.params?.id;
  const customer = useCustomer(id);
  const { setStatus, showToast, token } = useApp();
  const [selected, setSelected] = useState(customer?.status || 'Under Process');
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      let apiStatus;
      if (selected === 'Approved') apiStatus = 'APPROVED';
      else if (selected === 'Rejected') apiStatus = 'REJECTED';
      else if (selected === 'Under Process') apiStatus = 'UNDER_REVIEW';
      
      if (apiStatus) {
        const resp = await ApiService.updateApplicationStatus(token, id, {
          status: apiStatus,
          remarks: `${selected} by salesperson`
        });
        const text = await resp.text();
        let data = {};
        try { data = JSON.parse(text); } catch(e) {}
        if (!resp.ok) {
          showToast(data.message || `Failed to update status to ${selected}`);
          setLoading(false);
          return;
        }
      }
      
      // Still set status locally for UI update in MVP
      setStatus(id, selected);
      showToast(`Status updated to ${selected}`);
      navigation.goBack();
    } catch (e) {
      showToast('Network error');
    }
    setLoading(false);
  }

  return (
    <>
      <Screen>
        <Header title="Update status" />
      <Text style={[type.muted, { marginTop: 10, marginBottom: 12 }]}>
        Defined status model keeps ownership clear for the lead and salesperson.
      </Text>
      {['Under Process', 'Approved', 'Rejected'].map((status) => {
        const on = status === selected;
        return (
          <Pressable key={status} onPress={() => setSelected(status)} style={[styles.opt, on && styles.on]}>
            <View style={[styles.dot, { backgroundColor: on ? colors.teal : '#CBD5E1' }]} />
            <Text style={type.title}>{status}</Text>
          </Pressable>
        );
      })}
      <View style={{ marginTop: 8 }}>
        <Btn label="Save status" onPress={save} />
      </View>
    </Screen>
    <LoaderOverlay visible={loading} />
  </>
  );
}

const styles = StyleSheet.create({
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  on: { borderColor: colors.teal, backgroundColor: colors.tealSoft },
  dot: { width: 14, height: 14, borderRadius: 7 },
});
