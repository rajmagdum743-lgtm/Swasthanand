export interface DealerStatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  color: string;
}

export interface AssignedInventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minThreshold: number;
  batchId: string;
  expiryDate: string;
}

export interface BatchLifecycle {
  batchId: string;
  productName: string;
  status: 'harvesting' | 'processing' | 'logistics' | 'delivered';
  lastUpdated: string;
  progress: number; // 0 to 100
}

export interface PendingDispatch {
  orderId: string;
  customerName: string;
  items: string;
  qty: number;
  dispatchTime: string;
  status: 'ready' | 'packing' | 'shipping';
}

export const dealerStats: DealerStatCard[] = [
  {
    title: 'Available Inventory',
    value: '4,120 Units',
    change: '98% Warehouse Capacity',
    trend: 'neutral',
    color: 'emerald'
  },
  {
    title: 'Pending Orders',
    value: '8 Orders',
    change: '4 Awaiting QC check',
    trend: 'up',
    color: 'amber'
  },
  {
    title: 'Processed Orders',
    value: '128 Orders',
    change: '+14 today',
    trend: 'up',
    color: 'blue'
  },
  {
    title: 'Expiring Products',
    value: '2 Batches',
    change: 'Required review within 30 days',
    trend: 'down',
    color: 'rose'
  }
];

export const assignedInventory: AssignedInventoryItem[] = [
  {
    id: 'P-101',
    name: 'Pure A2 Vedic Ghee',
    sku: 'GHEE-A2-500',
    category: 'Ghee & Dairy',
    stock: 245,
    minThreshold: 30,
    batchId: 'B-GHEE-920',
    expiryDate: '2026-12-14'
  },
  {
    id: 'P-102',
    name: 'Organic Turmeric Finger',
    sku: 'SPICE-TUR-100',
    category: 'Spices',
    stock: 12,
    minThreshold: 50,
    batchId: 'B-TURM-844',
    expiryDate: '2026-09-08'
  },
  {
    id: 'P-103',
    name: 'Moringa Powder',
    sku: 'SF-MOR-250',
    category: 'Superfoods',
    stock: 8,
    minThreshold: 25,
    batchId: 'B-MORI-102',
    expiryDate: '2026-08-30'
  },
  {
    id: 'P-104',
    name: 'Indrayani Rice (Hand-Pounded)',
    sku: 'GRAIN-IND-1000',
    category: 'Grains & Pulses',
    stock: 450,
    minThreshold: 100,
    batchId: 'B-RICE-309',
    expiryDate: '2027-02-18'
  },
  {
    id: 'P-105',
    name: 'Organic Jaggery Powder',
    sku: 'SWEET-JAG-500',
    category: 'Others',
    stock: 95,
    minThreshold: 40,
    batchId: 'B-JAGG-482',
    expiryDate: '2026-10-22'
  }
];

export const batchLifecycles: BatchLifecycle[] = [
  {
    batchId: 'B-GHEE-920',
    productName: 'Pure A2 Vedic Ghee',
    status: 'logistics',
    lastUpdated: '10 mins ago',
    progress: 75
  },
  {
    batchId: 'B-TURM-844',
    productName: 'Organic Turmeric Finger',
    status: 'delivered',
    lastUpdated: '1 hour ago',
    progress: 100
  },
  {
    batchId: 'B-MORI-102',
    productName: 'Moringa Powder',
    status: 'processing',
    lastUpdated: '3 hours ago',
    progress: 45
  },
  {
    batchId: 'B-RICE-309',
    productName: 'Indrayani Rice',
    status: 'harvesting',
    lastUpdated: '1 day ago',
    progress: 20
  }
];

export const pendingDispatches: PendingDispatch[] = [
  {
    orderId: 'ORD-9304',
    customerName: 'Kolhapur Organic Mart',
    items: 'A2 Ghee, Turmeric Finger',
    qty: 125,
    dispatchTime: 'In 2 hrs',
    status: 'packing'
  },
  {
    orderId: 'ORD-9289',
    customerName: 'Karad Super Foods',
    items: 'Indrayani Rice, Jaggery Powder',
    qty: 200,
    dispatchTime: 'Tomorrow at 09:00',
    status: 'ready'
  },
  {
    orderId: 'ORD-9275',
    customerName: 'Satara Wellness Retail',
    items: 'Moringa Powder, Ghee',
    qty: 58,
    dispatchTime: 'Shipping today',
    status: 'shipping'
  }
];
