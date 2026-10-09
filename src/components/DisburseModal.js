import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Btn, Field, Input } from './ui';
import { DatePickerModal, formatReadableDate, parseDateISO } from './DateInput';
import { CalendarIcon, CheckCircleIcon } from './Icons';
import { colors, type } from '../theme';


function getNextMonthDay(dayOfMonth) {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(dayOfMonth);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDaysFromToday(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}


export function DisburseModal({ visible, onClose, onConfirm, initialAmount, loading = false }) {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('10.5');
  const [tenure, setTenure] = useState('36');
  const [emiAmount, setEmiAmount] = useState('');
  const [firstEmiDate, setFirstEmiDate] = useState(getDaysFromToday(30));
  const [remarks, setRemarks] = useState('Disbursed by salesperson');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [lastEmiDate, setLastEmiDate] = useState('');
  const [lastEmiCalendarVisible, setLastEmiCalendarVisible] = useState(false);

  useEffect(() => {
    if (initialAmount) {
      const sanitized = String(initialAmount).replace(/[^\d.]/g, '');
      if (sanitized) setLoanAmount(sanitized);
    }
  }, [initialAmount]);



  function handleConfirm() {
    const p = parseFloat(loanAmount);
    const r = parseFloat(interestRate);
    const n = parseInt(tenure, 10);
    const emi = parseFloat(emiAmount);

    if (!p || p <= 0) return;
    if (isNaN(r) || r < 0 || r > 100) return;
    if (!n || n <= 0) return;
    if (!emi || emi <= 0) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(firstEmiDate)) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(lastEmiDate)) return;

    onConfirm({
      loanAmount: p,
      firstEmiDate: firstEmiDate.trim(),
      lastEmiDate: lastEmiDate.trim(),
      interestRate: r,
      totalNumberOfEmi: n,
      emiAmount: emi,
      remarks: remarks.trim() || undefined,
    });
  }

  const isValid =
    parseFloat(loanAmount) > 0 &&
    parseFloat(interestRate) >= 0 &&
    parseInt(tenure, 10) > 0 &&
    parseFloat(emiAmount) > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(firstEmiDate) &&
    /^\d{4}-\d{2}-\d{2}$/.test(lastEmiDate);

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.backdrop}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <View style={styles.sheet}>
            <View style={styles.handleBar} />
            <Text style={styles.title}>Disburse Loan</Text>
            <Text style={type.muted}>
              Record sanctioned loan details and transition application to Disbursed.
            </Text>

            <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
              <View style={{ height: 12 }} />
              <Field label="Sanctioned Loan Amount (₹)">
                <Input
                  value={loanAmount}
                  onChangeText={setLoanAmount}
                  keyboardType="numeric"
                  placeholder="e.g. 500000"
                />
              </Field>

              <View style={styles.twoCol}>
                <Field label="Interest Rate (% p.a.)" style={{ flex: 1 }}>
                  <Input
                    value={interestRate}
                    onChangeText={setInterestRate}
                    keyboardType="numeric"
                    placeholder="e.g. 10.5"
                  />
                </Field>
                <Field label="Tenure (Months)" style={{ flex: 1 }}>
                  <Input
                    value={tenure}
                    onChangeText={setTenure}
                    keyboardType="numeric"
                    placeholder="e.g. 36"
                  />
                </Field>
              </View>

              <View style={styles.twoCol}>
                <Field label="Monthly EMI (₹)" style={{ flex: 1 }}>
                  <Input
                    value={emiAmount}
                    onChangeText={setEmiAmount}
                    keyboardType="numeric"
                    placeholder="e.g. 15000"
                  />
                </Field>

                {/* First EMI Date Picker */}
                <Field label="First EMI Date" style={{ flex: 1 }}>
                  <Pressable
                    onPress={() => setCalendarVisible(true)}
                    style={({ pressed }) => [
                      styles.datePickerBtn,
                      pressed && styles.pressedOpacity,
                    ]}
                  >
                    <View style={styles.calendarIconCircle}>
                      <CalendarIcon size={16} color={colors.tealDeep} />
                    </View>
                    <View style={styles.dateTextWrap}>
                      <Text style={styles.dateDisplayText} numberOfLines={1}>
                        {firstEmiDate
                          ? formatReadableDate(parseDateISO(firstEmiDate))
                          : 'Select date'}
                      </Text>
                      <Text style={styles.dateIsoSubText}>{firstEmiDate}</Text>
                    </View>
                  </Pressable>
                </Field>
              </View>


              <Field label="Last EMI Date">
                <Pressable
                  onPress={() => setLastEmiCalendarVisible(true)}
                  style={({ pressed }) => [
                    styles.datePickerBtn,
                    pressed && styles.pressedOpacity,
                  ]}
                >
                  <View style={styles.calendarIconCircle}>
                    <CalendarIcon size={16} color={colors.tealDeep} />
                  </View>
                  <View style={styles.dateTextWrap}>
                    <Text style={styles.dateDisplayText} numberOfLines={1}>
                      {lastEmiDate
                        ? formatReadableDate(parseDateISO(lastEmiDate))
                        : 'Select date'}
                    </Text>
                    <Text style={styles.dateIsoSubText}>{lastEmiDate || 'No date selected'}</Text>
                  </View>
                </Pressable>
              </Field>

              <Field label="Remarks (Optional)">
                <Input
                  value={remarks}
                  onChangeText={setRemarks}
                  placeholder="e.g. Disbursed via Bank Transfer"
                />
              </Field>
            </ScrollView>

            <View style={styles.btnRow}>
              <Btn label="Cancel" variant="ghost" flex onPress={onClose} />
              <Pressable
                onPress={handleConfirm}
                disabled={!isValid || loading}
                style={({ pressed }) => [
                  styles.disburseHeroBtn,
                  (!isValid || loading) && styles.disburseHeroBtnDisabled,
                  pressed && styles.pressedOpacity,
                ]}
              >
                <CheckCircleIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.disburseHeroBtnText}>
                  {loading ? 'Disbursing...' : 'Disburse Loan'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Centered Material Date Picker Dialog */}
      <DatePickerModal
        visible={calendarVisible}
        value={firstEmiDate}
        label="Select First EMI Date"
        onConfirm={(d) => {
          setFirstEmiDate(d);
          setCalendarVisible(false);
        }}
        onClose={() => setCalendarVisible(false)}
      />

      <DatePickerModal
        visible={lastEmiCalendarVisible}
        value={lastEmiDate || getDaysFromToday(30)}
        label="Select Last EMI Date"
        onConfirm={(d) => {
          setLastEmiDate(d);
          setLastEmiCalendarVisible(false);
        }}
        onClose={() => setLastEmiCalendarVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
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
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.line,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: 'Fraunces-Bold',
    fontSize: 20,
    color: colors.navy,
    marginBottom: 4,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  datePickerBtn: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTextWrap: {
    flex: 1,
  },
  dateDisplayText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12.5,
    color: colors.ink,
  },
  dateIsoSubText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    color: colors.muted,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  disburseHeroBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#15803D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#15803D',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  disburseHeroBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.6,
  },
  disburseHeroBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  pressedOpacity: {
    opacity: 0.85,
  },
});
