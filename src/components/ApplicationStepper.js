import { StyleSheet, Text, View } from 'react-native';
import { AlertCircleIcon, CheckIcon, XIcon } from './Icons';
import { colors } from '../theme';

const STEPS = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'In Review' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'DISBURSED', label: 'Disbursed' },
];

function getActiveStepIndex(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'DISBURSED' || s === 'COMPLETED') return 3;
  if (s === 'APPROVED') return 2;
  if (s === 'UNDER_REVIEW' || s === 'DOCUMENTS_VERIFIED' || s === 'DOCUMENTS_UPLOADED') return 1;
  return 0; // DRAFT or SUBMITTED
}

export function ApplicationStepper({ status }) {
  const s = String(status || '').toUpperCase();
  const isRejected = s === 'REJECTED';
  const activeIndex = getActiveStepIndex(status);

  return (
    <View style={styles.card}>
      <View style={styles.stepsRow}>
        {STEPS.map((step, idx) => {
          const isPassed = !isRejected && idx < activeIndex;
          const isCurrent = !isRejected && idx === activeIndex;

          let circleBg = '#F1F5F9';

          if (isPassed) {
            circleBg = colors.greenSoft;
          } else if (isCurrent) {
            circleBg = '#FFFFFF';
          } else if (isRejected && idx === activeIndex) {
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
                    isRejected && idx === activeIndex && styles.rejectedCircle,
                  ]}
                >
                  {isPassed ? (
                    <CheckIcon size={14} color={colors.greenText} strokeWidth={2.5} />
                  ) : isRejected && idx === activeIndex ? (
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
                  isRejected && idx === activeIndex && styles.rejectedLabel,
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      {isRejected && (
        <View style={styles.rejectedBanner}>
          <AlertCircleIcon size={14} color={colors.red} />
          <Text style={styles.rejectedBannerText}>Application Rejected</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 14,
    marginVertical: 10,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  nodeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  connectorLine: {
    position: 'absolute',
    right: '50%',
    width: '100%',
    height: 2.5,
    top: 15,
    zIndex: 0,
  },
  connectorActive: {
    backgroundColor: '#10B981',
  },
  connectorInactive: {
    backgroundColor: '#E2E8F0',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    zIndex: 1,
  },
  activeCircle: {
    borderColor: '#10B981',
    backgroundColor: '#FFFFFF',
    shadowColor: '#10B981',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rejectedCircle: {
    borderColor: colors.red,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  markText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.muted,
  },
  label: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: colors.muted,
    marginTop: 6,
    textAlign: 'center',
  },
  activeLabel: {
    fontFamily: 'DMSans-Bold',
    color: colors.navy,
  },
  passedLabel: {
    color: colors.greenText,
  },
  rejectedLabel: {
    color: colors.red,
    fontFamily: 'DMSans-Bold',
  },
  rejectedBanner: {
    marginTop: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rejectedBannerText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.red,
  },
});
