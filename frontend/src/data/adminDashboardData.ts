export interface AdminStatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  color: string;
}

export interface DealerPerformance {
  id: string;
  name: string;
  location: string;
  revenue: string;
  orders: number;
  rating: number;
  status: 'active' | 'warning' | 'critical';
}

export interface SystemAlert {
  id: string;
  source: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  time: string;
}

export interface OrderTrend {
  date: string;
  orders: number;
  revenue: number;
}

export const adminStats: AdminStatCard[] = [
  {
    title: 'Total Revenue',
    value: '₹2,482,900',
    change: '+14.2% from last month',
    trend: 'up',
    color: 'emerald'
  },
  {
    title: 'Total Orders',
    value: '1,842',
    change: '+8.6% from last month',
    trend: 'up',
    color: 'blue'
  },
  {
    title: 'Total Customers',
    value: '12,408',
    change: '+18.1% year over year',
    trend: 'up',
    color: 'indigo'
  },
  {
    title: 'Total Dealers',
    value: '48 Nodes',
    change: '+3 new this week',
    trend: 'up',
    color: 'amber'
  },
  {
    title: 'Total Products',
    value: '186 Items',
    change: '12 new categories',
    trend: 'neutral',
    color: 'purple'
  },
  {
    title: 'Inventory Health',
    value: '94.2%',
    change: '-1.5% low stock items',
    trend: 'down',
    color: 'rose'
  }
];

export const dealerPerformanceList: DealerPerformance[] = [
  {
    id: 'D-001',
    name: 'Satara Agri-Coop Center',
    location: 'Satara, Maharashtra',
    revenue: '₹480,500',
    orders: 312,
    rating: 4.9,
    status: 'active'
  },
  {
    id: 'D-002',
    name: 'Pune Hub & Cold Storage',
    location: 'Pune, Maharashtra',
    revenue: '₹620,000',
    orders: 489,
    rating: 4.8,
    status: 'active'
  },
  {
    id: 'D-003',
    name: 'Mumbai B2B Distribution Point',
    location: 'Mumbai, Maharashtra',
    revenue: '₹750,200',
    orders: 582,
    rating: 4.5,
    status: 'active'
  },
  {
    id: 'D-004',
    name: 'Sangli Farmers Union Warehouse',
    location: 'Sangli, Maharashtra',
    revenue: '₹310,000',
    orders: 201,
    rating: 4.2,
    status: 'warning'
  },
  {
    id: 'D-005',
    name: 'Kolhapur Distribution Node',
    location: 'Kolhapur, Maharashtra',
    revenue: '₹120,400',
    orders: 98,
    rating: 3.8,
    status: 'critical'
  }
];

export const systemAlerts: SystemAlert[] = [
  {
    id: 'ALT-401',
    source: 'Kolhapur Node',
    message: 'Temperature threshold exceeded in Cold Room 2 (+4°C variance)',
    severity: 'high',
    time: '2 mins ago'
  },
  {
    id: 'ALT-302',
    source: 'Sangli Warehouse',
    message: 'Moringa Powder stock level below replenishment point',
    severity: 'medium',
    time: '15 mins ago'
  },
  {
    id: 'ALT-204',
    source: 'Payment Gateway',
    message: 'Razorpay webhook API latency spiked above 500ms',
    severity: 'low',
    time: '1 hour ago'
  },
  {
    id: 'ALT-105',
    source: 'Database',
    message: 'Automated backup completed (Size: 1.4 GB)',
    severity: 'low',
    time: '4 hours ago'
  }
];

export const orderTrendsData: OrderTrend[] = [
  { date: 'Mon', orders: 120, revenue: 145000 },
  { date: 'Tue', orders: 150, revenue: 180000 },
  { date: 'Wed', orders: 180, revenue: 210000 },
  { date: 'Thu', orders: 140, revenue: 175000 },
  { date: 'Fri', orders: 200, revenue: 245000 },
  { date: 'Sat', orders: 220, revenue: 270000 },
  { date: 'Sun', orders: 240, revenue: 310000 }
];

export const inventoryDistributionData = [
  { category: 'Ghee & Dairy', percentage: 35, count: 65 },
  { category: 'Grains & Pulses', percentage: 25, count: 46 },
  { category: 'Spices', percentage: 20, count: 37 },
  { category: 'Superfoods', percentage: 12, count: 22 },
  { category: 'Others', percentage: 8, count: 16 }
];
