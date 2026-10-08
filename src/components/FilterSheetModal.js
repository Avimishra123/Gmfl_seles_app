import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, type } from '../theme';

export function FilterSheetModal({
  visible,
  onClose,
  title = 'Filter',
  categoryOptions = [],
  selectedCategory = 'ALL',
  onSelectCategory,
  dateRangeOptions = [
    { key: 'ALL', label: 'All Time' },
    { key: 'TODAY', label: 'Today' },
    { key: 'WEEK', label: 'Last 7 Days' },
    { key: 'MONTH', label: 'This Month' },
  ],
  selectedDateRange = 'ALL',
  onSelectDateRange,
  sortOptions = [
    { key: 'NEWEST', label: 'Newest First' },
    { key: 'OLDEST', label: 'Oldest First' },
  ],
  selectedSort = 'NEWEST',
  onSelectSort,
  onResetAll,
  onApply,
}) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handleBar} />

          <View style={styles.headerRow}>
            <Text style={styles.sheetTitle}>{title}</Text>
            {onResetAll ? (
              <Pressable onPress={onResetAll} hitSlop={8}>
                <Text style={styles.resetAllText}>Reset All</Text>
              </Pressable>
            ) : null}
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Category / Product Line Section */}
            {categoryOptions.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CATEGORY / PRODUCT</Text>
                <View style={styles.pillWrap}>
                  {categoryOptions.map((cat) => {
                    const isSelected = selectedCategory === cat.key;
                    return (
                      <Pressable
                        key={cat.key}
                        onPress={() => onSelectCategory && onSelectCategory(cat.key)}
                        style={({ pressed }) => [
                          styles.filterPill,
                          isSelected && styles.filterPillActive,
                          pressed && styles.pressedOpacity,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterPillText,
                            isSelected && styles.filterPillTextActive,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {/* Date Range Section */}
            {dateRangeOptions.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>TIMELINE / DATE RANGE</Text>
                <View style={styles.pillWrap}>
                  {dateRangeOptions.map((dr) => {
                    const isSelected = selectedDateRange === dr.key;
                    return (
                      <Pressable
                        key={dr.key}
                        onPress={() => onSelectDateRange && onSelectDateRange(dr.key)}
                        style={({ pressed }) => [
                          styles.filterPill,
                          isSelected && styles.filterPillActive,
                          pressed && styles.pressedOpacity,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterPillText,
                            isSelected && styles.filterPillTextActive,
                          ]}
                        >
                          {dr.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {/* Sort Order Section */}
            {sortOptions.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SORT BY</Text>
                <View style={styles.pillWrap}>
                  {sortOptions.map((sort) => {
                    const isSelected = selectedSort === sort.key;
                    return (
                      <Pressable
                        key={sort.key}
                        onPress={() => onSelectSort && onSelectSort(sort.key)}
                        style={({ pressed }) => [
                          styles.filterPill,
                          isSelected && styles.filterPillActive,
                          pressed && styles.pressedOpacity,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterPillText,
                            isSelected && styles.filterPillTextActive,
                          ]}
                        >
                          {sort.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* Sticky Bottom Actions */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.cancelBtn,
                pressed && styles.pressedOpacity,
              ]}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (onApply) onApply();
                if (onClose) onClose();
              }}
              style={({ pressed }) => [
                styles.applyBtn,
                pressed && styles.pressedOpacity,
              ]}
            >
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
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
    maxHeight: '80%',
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetTitle: {
    fontFamily: 'Fraunces-Bold',
    fontSize: 20,
    color: colors.navy,
  },
  resetAllText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#0284C7',
  },
  scrollArea: {
    maxHeight: 380,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.line,
  },
  filterPillActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  filterPillText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12.5,
    color: colors.navy,
  },
  filterPillTextActive: {
    color: '#0284C7',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13.5,
    color: colors.muted,
  },
  applyBtn: {
    flex: 1.4,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  applyBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  pressedOpacity: {
    opacity: 0.82,
  },
});
