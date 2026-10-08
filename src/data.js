export const AGENT = {
  name: 'Rahul Sharma',
  code: 'RAHUL1024',
  mobile: '+91 98100 10240',
  email: 'rahul@gmfl.app',
  link: 'https://gmfl.app/user?agent=RAHUL1024',
};

export const DEMO_OTP = '123456';
export const DEMO_MOBILE = '9810010240';

export const STATUSES = [
  'Draft',
  'Submitted',
  'Documents Pending',
  'Documents Under Review',
  'Documents Rejected',
  'Under Process',
  'Approved',
  'Completed',
];

const CUSTOMERS = [
  {
    id: 'amit',
    name: 'Amit Kumar',
    product: 'Home Loan',
    line: 'loan',
    status: 'Under Process',
    app: 'LN-2026-000125',
    date: '28 Aug 2026',
    mobile: '+91 98765 43210',
    email: 'amit@example.com',
    address: 'Andheri West, Mumbai, Maharashtra',
    group: 'live',
    docs: [
      { name: 'Aadhaar Card', state: 'approved' },
      { name: 'PAN Card', state: 'review' },
      { name: 'Voter ID', state: 'approved' },
      { name: 'Property Documents', state: 'review' },
      { name: 'Income Proof', state: 'pending' },
    ],
  },
  {
    id: 'raj',
    name: 'Raj Mehta',
    product: 'Personal Loan',
    line: 'loan',
    status: 'Documents Pending',
    app: 'LN-2026-000188',
    date: '02 Sep 2026',
    mobile: '+91 98200 11122',
    email: 'raj@example.com',
    address: 'Pune, Maharashtra',
    group: 'live',
    docs: [
      { name: 'Aadhaar Card', state: 'approved' },
      { name: 'PAN Card', state: 'review' },
      { name: 'Salary Slip', state: 'pending' },
      { name: 'Bank Statement', state: 'pending' },
    ],
  },
  {
    id: 'priya',
    name: 'Priya Shah',
    product: 'Business Loan',
    line: 'loan',
    status: 'Completed',
    app: 'LN-2026-000090',
    date: '12 Jul 2026',
    mobile: '+91 99000 33445',
    email: 'priya@example.com',
    address: 'Ahmedabad, Gujarat',
    group: 'done',
    docs: [
      { name: 'Aadhaar Card', state: 'approved' },
      { name: 'PAN Card', state: 'approved' },
    ],
  },
  {
    id: 'karan',
    name: 'Karan Singh',
    product: 'Home Loan',
    line: 'loan',
    status: 'Under Process',
    app: 'LN-2026-000201',
    date: '05 Sep 2026',
    mobile: '+91 98111 66778',
    email: 'karan@example.com',
    address: 'Jaipur, Rajasthan',
    group: 'live',
    docs: [
      { name: 'Aadhaar Card', state: 'approved' },
      { name: 'PAN Card', state: 'approved' },
      { name: 'Voter ID', state: 'review' },
    ],
  },
  {
    id: 'neha',
    name: 'Neha Verma',
    product: 'Health Insurance',
    line: 'insurance',
    status: 'Completed',
    app: 'IN-2026-000044',
    date: '20 Jun 2026',
    bank: 'HDFC Bank',
    cover: '₹10 Lakh',
    premium: '₹12,400/yr',
    mobile: '+91 97655 22110',
    email: 'neha@example.com',
    address: 'Lucknow, Uttar Pradesh',
    group: 'done',
    docs: [
      { name: 'Aadhaar Card', state: 'approved' },
      { name: 'PAN Card', state: 'approved' },
    ],
  },
  {
    id: 'sana',
    name: 'Sana Iqbal',
    product: 'Term Insurance',
    line: 'insurance',
    status: 'Documents Pending',
    app: 'IN-2026-000118',
    date: '08 Sep 2026',
    bank: 'State Bank of India',
    cover: '₹1 Crore',
    premium: '₹18,900/yr',
    mobile: '+91 98450 22190',
    email: 'sana@example.com',
    address: 'Banjara Hills, Hyderabad',
    group: 'live',
    docs: [
      { name: 'Aadhaar Card', state: 'approved' },
      { name: 'PAN Card', state: 'review' },
      { name: 'Income Proof', state: 'pending' },
    ],
  },
  {
    id: 'vikram',
    name: 'Vikram Patel',
    product: 'Motor Insurance',
    line: 'insurance',
    status: 'Under Process',
    app: 'IN-2026-000132',
    date: '14 Sep 2026',
    bank: 'ICICI Bank',
    cover: '₹8.5 Lakh',
    premium: '₹9,200/yr',
    mobile: '+91 99250 77881',
    email: 'vikram@example.com',
    address: 'Navrangpura, Ahmedabad',
    group: 'live',
    docs: [
      { name: 'Aadhaar Card', state: 'approved' },
      { name: 'RC Copy', state: 'review' },
      { name: 'Previous Policy', state: 'approved' },
    ],
  },
  {
    id: 'ananya',
    name: 'Ananya Rao',
    product: 'Mutual Fund SIP',
    line: 'mutual',
    status: 'Under Process',
    app: 'MF-2026-000027',
    date: '18 Sep 2026',
    bank: 'HDFC Bank',
    scheme: 'HDFC Flexi Cap',
    amount: 'SIP ₹5,000/mo',
    mobile: '+91 98860 44112',
    email: 'ananya@example.com',
    address: 'Indiranagar, Bengaluru',
    group: 'live',
    docs: [
      { name: 'PAN Card', state: 'approved' },
      { name: 'Aadhaar Card', state: 'review' },
      { name: 'Cancelled Cheque', state: 'pending' },
    ],
  },
  {
    id: 'rohit',
    name: 'Rohit Desai',
    product: 'Mutual Fund',
    line: 'mutual',
    status: 'Completed',
    app: 'MF-2026-000011',
    date: '03 Jul 2026',
    bank: 'Axis Bank',
    scheme: 'Axis Bluechip',
    amount: 'Lumpsum ₹2,50,000',
    mobile: '+91 98198 33021',
    email: 'rohit@example.com',
    address: 'Bandra West, Mumbai',
    group: 'done',
    docs: [
      { name: 'PAN Card', state: 'approved' },
      { name: 'Aadhaar Card', state: 'approved' },
      { name: 'Cancelled Cheque', state: 'approved' },
    ],
  },
];

export function createCustomers() {
  return CUSTOMERS.map((customer) => ({
    ...customer,
    docs: customer.docs.map((doc) => ({ ...doc })),
  }));
}

export function shareMessage() {
  return `Open the GMFL user app with my agent code ${AGENT.code}. Link: ${AGENT.link}`;
}

export function leadMeta(customer) {
  if (customer.line === 'insurance') {
    return `Cover ${customer.cover} · Premium ${customer.premium}`;
  }
  return `${customer.scheme} · ${customer.amount}`;
}
