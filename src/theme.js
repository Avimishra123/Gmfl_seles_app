export const colors = {
  navy: '#0B192C',
  navy2: '#152C52',
  ink: '#0F172A',
  muted: '#64748B',
  line: '#E2E8F0',
  paper: '#F7F9FC',
  white: '#FFFFFF',
  teal: '#0077E6',
  tealDeep: '#0055B8',
  tealSoft: '#EBF4FF',
  gold: '#FF5722',
  goldSoft: '#FFF0EB',
  amber: '#F59E0B',
  amberSoft: '#FFF4D6',
  amberText: '#9A6B00',
  red: '#EF4444',
  redSoft: '#FEE2E2',
  green: '#10B981',
  greenSoft: '#D1FAE5',
  greenText: '#047857',
  indigoSoft: '#EEF2FF',
  indigo: '#4338CA',
};

export const type = {
  h1: { fontFamily: 'Fraunces-Bold', fontSize: 28, lineHeight: 32, color: colors.navy },
  h3: { fontFamily: 'DMSans-Bold', fontSize: 16, color: colors.navy },
  title: { fontFamily: 'DMSans-Bold', fontSize: 15, color: colors.navy },
  body: { fontFamily: 'DMSans-Medium', fontSize: 14, color: colors.ink },
  muted: { fontFamily: 'DMSans-Medium', fontSize: 13, lineHeight: 19, color: colors.muted },
  label: { fontFamily: 'DMSans-Bold', fontSize: 12, color: colors.muted, marginBottom: 6 },
  tiny: { fontFamily: 'DMSans-Bold', fontSize: 11, color: colors.muted },
};

export function chipColors(status) {
  const s = String(status || '').toLowerCase().replace(/[-_]/g, ' ');
  if (
    s.includes('complete') ||
    s.includes('convert') ||
    s.includes('disburse') ||
    (s.includes('approved') && !s.includes('under'))
  ) {
    return { bg: colors.greenSoft, fg: colors.greenText };
  }
  if (s.includes('reject') || s.includes('drop') || s.includes('cancel') || s.includes('pending')) {
    return { bg: colors.redSoft, fg: colors.red };
  }
  if (s.includes('follow') || s.includes('process') || s.includes('review')) {
    return { bg: colors.amberSoft, fg: colors.amberText };
  }
  if (s.includes('contact')) {
    return { bg: colors.indigoSoft, fg: colors.indigo };
  }
  return { bg: colors.tealSoft, fg: colors.tealDeep };
}

export function isLeadProduct(customer) {
  return customer?.line === 'insurance' || customer?.line === 'mutual';
}

export function isRedundantService(serviceType, serviceName) {
  if (!serviceType || !serviceName) return true;
  const t = String(serviceType).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const n = String(serviceName).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!t || !n) return true;
  if (t === n) return true;
  if (t.replace(/s$/, '') === n.replace(/s$/, '')) return true;
  const tNorm = t.replace(/mutal/g, 'mutual');
  const nNorm = n.replace(/mutal/g, 'mutual');
  if (tNorm === nNorm || tNorm.replace(/s$/, '') === nNorm.replace(/s$/, '')) return true;
  if ((tNorm.includes('mutual') || tNorm.includes('fund')) && (nNorm.includes('mutual') || nNorm.includes('fund'))) {
    return true;
  }
  return false;
}

export function getServiceMeta(serviceType, serviceName) {
  if (!serviceType && !serviceName) return 'Service';
  if (!serviceType) return serviceName;
  if (!serviceName) return serviceType;
  if (isRedundantService(serviceType, serviceName)) {
    return serviceType.length >= serviceName.length ? serviceType : serviceName;
  }
  const tClean = String(serviceType).trim().toLowerCase();
  const nClean = String(serviceName).trim().toLowerCase();
  if (nClean.includes(tClean)) {
    return serviceName;
  }
  return `${serviceType} · ${serviceName}`;
}

export function getLeadMeta(bankName, serviceType, serviceName) {
  const serviceText = getServiceMeta(serviceType, serviceName);
  const cleanBank = String(bankName || '').trim();
  if (!cleanBank) return serviceText;
  if (!serviceText || serviceText === 'Service') return cleanBank;
  if (serviceText.toLowerCase().includes(cleanBank.toLowerCase())) {
    return serviceText;
  }
  return `${cleanBank} · ${serviceText}`;
}

export function getApplicationMeta(bankName, categoryName, serviceName) {
  let cleanBank = String(bankName || '').trim();
  let cleanCat = String(categoryName || '').trim();
  const cleanService = String(serviceName || '').trim();

  // If bank is missing, try detecting known banks from service or category string
  if (!cleanBank) {
    const knownBanks = [
      'Bank of Baroda',
      'HDFC Bank',
      'HDFC',
      'ICICI Bank',
      'ICICI',
      'State Bank of India',
      'SBI',
      'Axis Bank',
      'Kotak Mahindra Bank',
      'Kotak Bank',
      'Kotak',
      'Bajaj Finserv',
      'Tata Capital',
      'Punjab National Bank',
      'PNB',
      'Canara Bank',
      'Union Bank of India',
      'Union Bank',
      'IDFC First Bank',
      'IDFC',
      'IndusInd Bank',
      'Federal Bank',
      'Yes Bank',
    ];
    const combined = `${cleanCat} ${cleanService}`;
    for (const b of knownBanks) {
      if (combined.toLowerCase().includes(b.toLowerCase())) {
        cleanBank = b;
        break;
      }
    }
  }

  // If category is missing, derive category from cleanService
  if (!cleanCat && cleanService) {
    if (cleanBank && cleanService.toLowerCase().startsWith(cleanBank.toLowerCase())) {
      cleanCat = cleanService.slice(cleanBank.length).replace(/^[\s·\-_:]+/, '').trim();
    } else {
      cleanCat = cleanService;
    }
  }

  // If cleanCat starts with or contains cleanBank, strip it from category to prevent duplication
  if (cleanBank && cleanCat) {
    if (cleanCat.toLowerCase().startsWith(cleanBank.toLowerCase())) {
      const rest = cleanCat.slice(cleanBank.length).replace(/^[\s·\-_:]+/, '').trim();
      if (rest) cleanCat = rest;
    }
  }

  // Clean and capitalize category (e.g. "home Loan" -> "Home Loan")
  if (cleanCat) {
    cleanCat = cleanCat
      .split(' ')
      .filter(Boolean)
      .map((w) => (w.length <= 1 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(' ');
  }

  if (cleanBank && cleanCat) {
    return `${cleanBank} · ${cleanCat}`;
  }

  return cleanBank || cleanCat || cleanService || 'Loan Application';
}


export const DATE_RANGE_OPTIONS = [
  { key: 'ALL', label: 'All Time' },
  { key: 'TODAY', label: 'Today' },
  { key: 'WEEK', label: 'Last 7 Days' },
  { key: 'MONTH', label: 'This Month' },
];

export function matchesDateRange(createdAt, range) {
  if (!range || range === 'ALL') return true;
  if (!createdAt) return false;
  let d;
  if (typeof createdAt === 'object' && createdAt._seconds) {
    d = new Date(createdAt._seconds * 1000);
  } else {
    d = new Date(createdAt);
  }
  if (isNaN(d.getTime())) return true;
  const now = new Date();

  if (range === 'TODAY') {
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }
  if (range === 'WEEK') {
    const diff = now.getTime() - d.getTime();
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  }
  if (range === 'MONTH') {
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }
  return true;
}

export function param(value) {
  return Array.isArray(value) ? value[0] : value;
}

