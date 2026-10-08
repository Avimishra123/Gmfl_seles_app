import { StyleSheet, Text, View } from 'react-native';
import { AlertCircleIcon, CheckIcon, XIcon } from './Icons';
import { colors } from '../theme';

const LEAD_STEPS = [
  { key: 'NEW', label: 'New' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'FOLLOW_UP', label: 'Follow Up' },
  { key: 'CONVERTED', label: 'Converted' },
];

function getActiveLeadStepIndex(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'CONVERTED') return 3;
  if (s === 'FOLLOW_UP') return 2;
  if (s === 'CONTACTED') return 1;
  return 0; // NEW or default
}

export function LeadStepper({ status, dropRemarks }) {
  const s = String(status || '').toUpperCase();
  const isDropped = s === 'DROPPED';
  const activeIndex = getActiveLeadStepIndex(status);

  return (
    <View style={styles.card}>
      <View style={styles.stepsRow}>
        {LEAD_STEPS.map((step, idx) => {
          const isPassed = !isDropped && idx < activeIndex;
          const isCurrent = !isDropped && idx === activeIndex;

          let circleBg = '#F1F5F9';

          if (isPassed) {
            circleBg = colors.greenSoft;
          } else if (isCurrent) {
            circleBg = '#FFFFFF';
          } else if (isDropped && idx === 0) {
            circleBg = colors.redSoft;
          }

          return (
            <View key={step.key} style={styles.stepContainer}>
              <View style={styles.nodeWrapper}>
                {idx > 0 && (
                  <View
                    style={[
                      styles.connectorLine,
                      isPassed || (isCurrent && idx > 0)
                        ? styles.connectorActive
                        : styles.connectorInactive,
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.circle,
                    { backgroundColor: circleBg },
                    isCurrent && styles.activeCircle,
                    isDropped && idx === 0 && styles.droppedCircle,
                  ]}
                >
                  {isPassed ? (
                    <CheckIcon size={14} color={colors.greenText} strokeWidth={2.5} />
                  ) : isDropped && idx === 0 ? (
                    <XIcon size={14} color={colors.red} strokeWidth={2.5} />
                  ) : isCurrent ? (
                    <View style={styles.activeDot} />
                  ) : (
                    <Text style={styles.markText}>{idx + 1}</Text>
                  )}
                </View>
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  isCurrent && styles.activeLabel,
                  isPassed && styles.passedLabel,
                  isDropped && idx === 0 && styles.droppedLabel,
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      {isDropped && (
        <View style={styles.droppedBanner}>
          <AlertCircleIcon size={14} color={colors.red} />
          <View style={styles.bannerTextWrap}>
            <Text style={styles.droppedBannerTitle}>Lead Dropped</Text>
            {dropRemarks ? (
              <Text style={styles.droppedBannerRemarks}>{dropRemarks}</Text>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  nodeWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 30,
  },
  connectorLine: {
    position: 'absolute',
    left: '-50%',
    right: '50%',
    top: 14,
    height: 2,
    zIndex: 1,
  },
  connectorActive: {
    backgroundColor: '#0284C7',
  },
  connectorInactive: {
    backgroundColor: '#E2E8F0',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  activeCircle: {
    borderColor: '#0284C7',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    shadowColor: '#0284C7',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  droppedCircle: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0284C7',
  },
  markText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: '#94A3B8',
  },
  label: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  activeLabel: {
    fontFamily: 'DMSans-Bold',
    color: '#0284C7',
  },
  passedLabel: {
    fontFamily: 'DMSans-Bold',
    color: colors.greenText,
  },
  droppedLabel: {
    fontFamily: 'DMSans-Bold',
    color: colors.red,
  },
  droppedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  bannerTextWrap: {
    flex: 1,
  },
  droppedBannerTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.red,
  },
  droppedBannerRemarks: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: '#991B1B',
    marginTop: 2,
  },
});
