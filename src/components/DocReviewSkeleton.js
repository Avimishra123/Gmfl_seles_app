import { ScrollView, StyleSheet, View } from 'react-native';
import { Screen, Shimmer } from './ui';
import { colors } from '../theme';

export function DocReviewSkeleton() {
  return (
    <Screen>
      {/* Header skeleton */}
      <View style={styles.header}>
        <Shimmer style={styles.backBtn} />
        <View style={styles.flexOne}>
          <Shimmer style={styles.headerTitle} />
          <Shimmer style={styles.headerSub} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Section Title skeleton */}
        <View style={styles.sectionHeaderWrap}>
          <Shimmer style={styles.sectionTitle} />
        </View>

        {/* Mandatory Documents Card skeleton */}
        <View style={styles.card}>
          {/* Document 1: Needs Review skeleton */}
          <View style={styles.docRow}>
            <View style={styles.docTopRow}>
              <Shimmer style={styles.markCircle} />
              <View style={styles.flexOne}>
                <View style={styles.titleWrap}>
                  <Shimmer style={styles.docTitle} />
                  <Shimmer style={styles.requiredPill} />
                </View>
              </View>
              <Shimmer style={styles.chip} />
            </View>

            <View style={styles.actionBtnsWrap}>
              <Shimmer style={styles.primaryActionBtn} />
              <View style={styles.btnRow}>
                <Shimmer style={styles.halfBtn} />
                <Shimmer style={styles.halfBtn} />
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Document 2: Upload Pending skeleton */}
          <View style={styles.docRow}>
            <View style={styles.docTopRow}>
              <Shimmer style={styles.markCircle} />
              <View style={styles.flexOne}>
                <View style={styles.titleWrap}>
                  <Shimmer style={styles.docTitleWide} />
                  <Shimmer style={styles.requiredPill} />
                </View>
              </View>
              <Shimmer style={styles.chipWide} />
            </View>

            <View style={styles.actionBtnsWrap}>
              <Shimmer style={styles.primaryActionBtn} />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Document 3: Verified skeleton */}
          <View style={styles.docRow}>
            <View style={styles.docTopRow}>
              <Shimmer style={styles.markCircle} />
              <View style={styles.flexOne}>
                <View style={styles.titleWrap}>
                  <Shimmer style={styles.docTitleMedium} />
                  <Shimmer style={styles.requiredPill} />
                </View>
              </View>
              <Shimmer style={styles.chip} />
            </View>

            <View style={styles.actionBtnsWrap}>
              <Shimmer style={styles.primaryActionBtn} />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Document 4: Verified without file */}
          <View style={styles.docRow}>
            <View style={styles.docTopRow}>
              <Shimmer style={styles.markCircle} />
              <View style={styles.flexOne}>
                <View style={styles.titleWrap}>
                  <Shimmer style={styles.docTitle} />
                  <Shimmer style={styles.requiredPill} />
                </View>
              </View>
              <Shimmer style={styles.chip} />
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  headerTitle: {
    width: 150,
    height: 18,
    borderRadius: 6,
  },
  headerSub: {
    width: 200,
    height: 12,
    borderRadius: 4,
    marginTop: 4,
  },
  sectionHeaderWrap: {
    marginTop: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionTitle: {
    width: 170,
    height: 12,
    borderRadius: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  docRow: {
    paddingVertical: 14,
  },
  docTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  docTitle: {
    width: 125,
    height: 15,
    borderRadius: 4,
  },
  docTitleWide: {
    width: 165,
    height: 15,
    borderRadius: 4,
  },
  docTitleMedium: {
    width: 140,
    height: 15,
    borderRadius: 4,
  },
  requiredPill: {
    width: 52,
    height: 16,
    borderRadius: 5,
  },
  chip: {
    width: 66,
    height: 22,
    borderRadius: 999,
  },
  chipWide: {
    width: 86,
    height: 22,
    borderRadius: 999,
  },
  actionBtnsWrap: {
    marginTop: 12,
    gap: 8,
  },
  primaryActionBtn: {
    width: '100%',
    height: 36,
    borderRadius: 10,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  halfBtn: {
    flex: 1,
    height: 34,
    borderRadius: 10,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
  },
  bottomSpacer: {
    height: 32,
  },
});
