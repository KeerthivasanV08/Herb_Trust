export interface HerbBatch {
  id: string;
  herbName: string;
  herbType: string;
  farmerName: string;
  farmerId: string;
  harvestDate: string;
  submissionDate: string;
  location: {
    lat: number;
    lng: number;
    region: string;
  };
  imageUrl: string;
  status: 'pending' | 'verified' | 'approved' | 'blocked';
  aiScore: number;
  ecoValidity: boolean;
  potency: number;
  potencyHistory: { date: string; value: number }[];
  blockchainHash: string;
  complianceStatus: 'approved' | 'pending' | 'blocked';
  quantity: number;
  unit: string;
}

export const herbTypes = [
  'Ashwagandha', 'Tulsi', 'Brahmi', 'Neem', 'Turmeric',
  'Amla', 'Shatavari', 'Guduchi', 'Triphala', 'Moringa',
];

export const mockBatches: HerbBatch[] = [
  {
    id: 'BTH-001', herbName: 'Ashwagandha Root', herbType: 'Ashwagandha',
    farmerName: 'Rajesh Kumar', farmerId: 'FRM-001',
    harvestDate: '2025-02-10', submissionDate: '2025-02-11',
    location: { lat: 23.2599, lng: 77.4126, region: 'Madhya Pradesh' },
    imageUrl: '/placeholder.svg', status: 'approved', aiScore: 94, ecoValidity: true,
    potency: 87, potencyHistory: [
      { date: '2025-02-08', value: 85 }, { date: '2025-02-09', value: 86 },
      { date: '2025-02-10', value: 87 }, { date: '2025-02-11', value: 87 },
    ],
    blockchainHash: '0x7f8a3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
    complianceStatus: 'approved', quantity: 250, unit: 'kg',
  },
  {
    id: 'BTH-002', herbName: 'Holy Basil Leaves', herbType: 'Tulsi',
    farmerName: 'Priya Sharma', farmerId: 'FRM-002',
    harvestDate: '2025-02-12', submissionDate: '2025-02-13',
    location: { lat: 26.8467, lng: 80.9462, region: 'Uttar Pradesh' },
    imageUrl: '/placeholder.svg', status: 'verified', aiScore: 89, ecoValidity: true,
    potency: 78, potencyHistory: [
      { date: '2025-02-12', value: 76 }, { date: '2025-02-13', value: 78 },
    ],
    blockchainHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    complianceStatus: 'pending', quantity: 180, unit: 'kg',
  },
  {
    id: 'BTH-003', herbName: 'Brahmi Extract', herbType: 'Brahmi',
    farmerName: 'Amit Patel', farmerId: 'FRM-003',
    harvestDate: '2025-02-08', submissionDate: '2025-02-09',
    location: { lat: 22.3072, lng: 73.1812, region: 'Gujarat' },
    imageUrl: '/placeholder.svg', status: 'blocked', aiScore: 45, ecoValidity: false,
    potency: 34, potencyHistory: [
      { date: '2025-02-08', value: 38 }, { date: '2025-02-09', value: 35 }, { date: '2025-02-10', value: 34 },
    ],
    blockchainHash: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d',
    complianceStatus: 'blocked', quantity: 120, unit: 'kg',
  },
  {
    id: 'BTH-004', herbName: 'Neem Bark', herbType: 'Neem',
    farmerName: 'Sunita Devi', farmerId: 'FRM-004',
    harvestDate: '2025-02-13', submissionDate: '2025-02-14',
    location: { lat: 25.5941, lng: 85.1376, region: 'Bihar' },
    imageUrl: '/placeholder.svg', status: 'pending', aiScore: 82, ecoValidity: true,
    potency: 71, potencyHistory: [{ date: '2025-02-14', value: 71 }],
    blockchainHash: '0x3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e',
    complianceStatus: 'pending', quantity: 95, unit: 'kg',
  },
  {
    id: 'BTH-005', herbName: 'Turmeric Rhizome', herbType: 'Turmeric',
    farmerName: 'Vikram Singh', farmerId: 'FRM-005',
    harvestDate: '2025-02-09', submissionDate: '2025-02-10',
    location: { lat: 15.3173, lng: 75.7139, region: 'Karnataka' },
    imageUrl: '/placeholder.svg', status: 'approved', aiScore: 97, ecoValidity: true,
    potency: 92, potencyHistory: [
      { date: '2025-02-09', value: 88 }, { date: '2025-02-10', value: 90 },
      { date: '2025-02-11', value: 91 }, { date: '2025-02-12', value: 92 },
    ],
    blockchainHash: '0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
    complianceStatus: 'approved', quantity: 320, unit: 'kg',
  },
  {
    id: 'BTH-006', herbName: 'Amla Fruit', herbType: 'Amla',
    farmerName: 'Lakshmi Naidu', farmerId: 'FRM-006',
    harvestDate: '2025-02-14', submissionDate: '2025-02-15',
    location: { lat: 17.3850, lng: 78.4867, region: 'Telangana' },
    imageUrl: '/placeholder.svg', status: 'verified', aiScore: 91, ecoValidity: true,
    potency: 84, potencyHistory: [{ date: '2025-02-15', value: 84 }],
    blockchainHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    complianceStatus: 'pending', quantity: 200, unit: 'kg',
  },
  {
    id: 'BTH-007', herbName: 'Shatavari Root', herbType: 'Shatavari',
    farmerName: 'Deepak Yadav', farmerId: 'FRM-007',
    harvestDate: '2025-02-11', submissionDate: '2025-02-12',
    location: { lat: 26.9124, lng: 75.7873, region: 'Rajasthan' },
    imageUrl: '/placeholder.svg', status: 'approved', aiScore: 88, ecoValidity: true,
    potency: 79, potencyHistory: [
      { date: '2025-02-11', value: 77 }, { date: '2025-02-12', value: 79 },
    ],
    blockchainHash: '0xaa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
    complianceStatus: 'approved', quantity: 160, unit: 'kg',
  },
  {
    id: 'BTH-008', herbName: 'Guduchi Stem', herbType: 'Guduchi',
    farmerName: 'Meena Kumari', farmerId: 'FRM-008',
    harvestDate: '2025-02-07', submissionDate: '2025-02-08',
    location: { lat: 19.0760, lng: 72.8777, region: 'Maharashtra' },
    imageUrl: '/placeholder.svg', status: 'blocked', aiScore: 52, ecoValidity: false,
    potency: 41, potencyHistory: [
      { date: '2025-02-07', value: 44 }, { date: '2025-02-08', value: 41 },
    ],
    blockchainHash: '0xbb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
    complianceStatus: 'blocked', quantity: 80, unit: 'kg',
  },
  {
    id: 'BTH-009', herbName: 'Moringa Leaves', herbType: 'Moringa',
    farmerName: 'Arjun Reddy', farmerId: 'FRM-009',
    harvestDate: '2025-02-13', submissionDate: '2025-02-14',
    location: { lat: 13.0827, lng: 80.2707, region: 'Tamil Nadu' },
    imageUrl: '/placeholder.svg', status: 'pending', aiScore: 76, ecoValidity: true,
    potency: 68, potencyHistory: [{ date: '2025-02-14', value: 68 }],
    blockchainHash: '0xcc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d',
    complianceStatus: 'pending', quantity: 140, unit: 'kg',
  },
  {
    id: 'BTH-010', herbName: 'Turmeric Powder', herbType: 'Turmeric',
    farmerName: 'Kavitha Bai', farmerId: 'FRM-010',
    harvestDate: '2025-02-15', submissionDate: '2025-02-16',
    location: { lat: 11.0168, lng: 76.9558, region: 'Tamil Nadu' },
    imageUrl: '/placeholder.svg', status: 'verified', aiScore: 93, ecoValidity: true,
    potency: 89, potencyHistory: [{ date: '2025-02-16', value: 89 }],
    blockchainHash: '0xdd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
    complianceStatus: 'approved', quantity: 275, unit: 'kg',
  },
];

export const dashboardStats = {
  farmer: {
    totalBatches: 24,
    pendingVerification: 3,
    approved: 18,
    rejected: 3,
  },
  manufacturer: {
    incomingBatches: 12,
    pendingDecision: 5,
    accepted: 42,
    rejected: 8,
  },
  auditor: {
    totalTracked: 156,
    compliant: 142,
    nonCompliant: 14,
    regionsMonitored: 8,
  },
};

// Chart data
export const submissionTrend = [
  { day: 'Mon', count: 3 }, { day: 'Tue', count: 5 }, { day: 'Wed', count: 2 },
  { day: 'Thu', count: 7 }, { day: 'Fri', count: 4 }, { day: 'Sat', count: 6 }, { day: 'Sun', count: 3 },
];

export const weeklyDecisionTrend = [
  { week: 'W1', accepted: 8, rejected: 2 }, { week: 'W2', accepted: 12, rejected: 3 },
  { week: 'W3', accepted: 10, rejected: 1 }, { week: 'W4', accepted: 15, rejected: 4 },
];

export const complianceTrend = [
  { day: 'Mon', compliant: 20, nonCompliant: 2 }, { day: 'Tue', compliant: 22, nonCompliant: 1 },
  { day: 'Wed', compliant: 18, nonCompliant: 3 }, { day: 'Thu', compliant: 25, nonCompliant: 2 },
  { day: 'Fri', compliant: 21, nonCompliant: 1 }, { day: 'Sat', compliant: 19, nonCompliant: 2 },
  { day: 'Sun', compliant: 17, nonCompliant: 3 },
];
