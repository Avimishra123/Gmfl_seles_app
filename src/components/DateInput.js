import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { colors } from '../theme';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function formatDateISO(date) {
  if (!date || isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateISO(str) {
  if (!str || typeof str !== 'string') return new Date();
  const parts = str.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const date = new Date(y, m, d);
    if (!isNaN(date.getTime())) return date;
  }
  return new Date();
}

export function formatReadableDate(date) {
  if (!date || isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = SHORT_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatFullDate(date) {
  if (!date || isNaN(date.getTime())) return '';
  const dayName = WEEK_DAYS[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const month = SHORT_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${month} ${year}`;
}

export function DatePickerModal({
  visible,
  value,
  onConfirm,
  onClose,
  label = 'Select Date',
}) {
  const initialDate = value ? parseDateISO(value) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [selectedDate, setSelectedDate] = useState(initialDate);

  if (!visible) return null;

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function selectDay(day) {
    const next = new Date(viewYear, viewMonth, day);
    setSelectedDate(next);
  }

  function handleConfirm() {
    if (onConfirm) {
      onConfirm(formatDateISO(selectedDate));
    }
  }

  // Calendar matrix
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const matrix = [];
  let currentWeek = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      matrix.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    matrix.push(currentWeek);
  }

  const today = new Date();
  const isSelected = (day) =>
    selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getFullYear() === viewYear;

  const isToday = (day) =>
    today.getDate() === day &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.dialogCard}>
          {/* Header Banner */}
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogHeaderLabel}>{label.toUpperCase()}</Text>
            <Text style={styles.dialogHeaderDate}>
              {formatFullDate(selectedDate)}
            </Text>
          </View>

          {/* Month Switcher */}
          <View style={styles.monthNavRow}>
            <Pressable
              onPress={prevMonth}
              style={({ pressed }) => [
                styles.navArrowBtn,
                pressed && styles.pressedOpacity,
              ]}
              hitSlop={8}
            >
              <ChevronLeftIcon size={18} color={colors.navy} />
            </Pressable>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>
            <Pressable
              onPress={nextMonth}
              style={({ pressed }) => [
                styles.navArrowBtn,
                pressed && styles.pressedOpacity,
              ]}
              hitSlop={8}
            >
              <ChevronRightIcon size={18} color={colors.navy} />
            </Pressable>
          </View>

          {/* Days of week */}
          <View style={styles.daysOfWeekRow}>
            {DAY_LABELS.map((lbl, idx) => (
              <Text
                key={idx}
                style={[
                  styles.dayOfWeekText,
                  (idx === 0 || idx === 6) && styles.weekendText,
                ]}
              >
                {lbl}
              </Text>
            ))}
          </View>

          {/* Calendar Days Matrix */}
          <View style={styles.matrixContainer}>
            {matrix.map((week, wIdx) => (
              <View key={wIdx} style={styles.weekRow}>
                {week.map((day, dIdx) => {
                  if (day === null) {
                    return <View key={dIdx} style={styles.dayCell} />;
                  }

                  const selected = isSelected(day);
                  const todayDate = isToday(day);

                  return (
                    <Pressable
                      key={dIdx}
                      onPress={() => selectDay(day)}
                      style={({ pressed }) => [
                        styles.dayCell,
                        styles.dayButton,
                        selected && styles.daySelected,
                        todayDate && !selected && styles.dayToday,
                        pressed && styles.dayPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumberText,
                          selected && styles.daySelectedText,
                          todayDate && !selected && styles.dayTodayText,
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.cancelBtn,
                pressed && styles.pressedOpacity,
              ]}
            >
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              style={({ pressed }) => [
                styles.confirmBtn,
                pressed && styles.pressedOpacity,
              ]}
            >
              <Text style={styles.confirmBtnText}>CONFIRM DATE</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function DateInput({
  value,
  onChangeDate,
  label = 'Select Date',
  placeholder = 'Select date',
  disabled = false,
}) {
  const [modalVisible, setModalVisible] = useState(false);

  function handleConfirm(dateStr) {
    if (onChangeDate) {
      onChangeDate(dateStr);
    }
    setModalVisible(false);
  }

  const formattedDisplay = value ? formatReadableDate(parseDateISO(value)) : '';

  return (
    <>
      <Pressable
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        style={({ pressed }) => [
          styles.inputContainer,
          pressed && styles.inputPressed,
          disabled && styles.inputDisabled,
        ]}
      >
        <View style={styles.inputLeft}>
          <View style={styles.calendarIconCircle}>
            <CalendarIcon size={16} color={colors.tealDeep} />
          </View>
          <View style={styles.dateTextWrap}>
            <Text
              style={[
                styles.dateDisplay,
                !formattedDisplay && styles.placeholderText,
              ]}
              numberOfLines={1}
            >
              {formattedDisplay || placeholder}
            </Text>
            {value ? <Text style={styles.isoSubText}>{value}</Text> : null}
          </View>
        </View>
        <ChevronRightIcon size={16} color="#94A3B8" />
      </Pressable>

      <DatePickerModal
        visible={modalVisible}
        value={value}
        label={label}
        onConfirm={handleConfirm}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputPressed: {
    borderColor: colors.teal,
    backgroundColor: '#F8FAFC',
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: '#F1F5F9',
  },
  inputLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
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
  dateDisplay: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: colors.ink,
  },
  placeholderText: {
    fontFamily: 'DMSans-Medium',
    color: '#94A3B8',
  },
  isoSubText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    color: colors.muted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  dialogHeader: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  dialogHeaderLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: '#E0F2FE',
    letterSpacing: 0.8,
  },
  dialogHeaderDate: {
    fontFamily: 'DMSans-Bold',
    fontSize: 17,
    color: '#FFFFFF',
    marginTop: 2,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: colors.navy,
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: colors.muted,
  },
  weekendText: {
    color: '#94A3B8',
  },
  matrixContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  dayCell: {
    flex: 1,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButton: {
    borderRadius: 17,
  },
  daySelected: {
    backgroundColor: '#0284C7',
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: '#0284C7',
  },
  dayPressed: {
    backgroundColor: '#E0F2FE',
  },
  dayNumberText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12.5,
    color: colors.navy,
  },
  daySelectedText: {
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
  },
  dayTodayText: {
    fontFamily: 'DMSans-Bold',
    color: '#0284C7',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 0.5,
  },
  confirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0284C7',
    borderRadius: 10,
  },
  confirmBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pressedOpacity: {
    opacity: 0.8,
  },
});
