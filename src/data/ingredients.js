/**
 * Bangladeshi Residential Construction Ingredients & Editable Market Rates (BDT)
 */
export const MASONRY_OPTIONS = [
  {
    id: 'brick_1st',
    nameBn: '১নং লাল ইট (1st Class Brick)',
    unit: 'পিস (pcs)',
    defaultPrice: 13.5,
    qtyPerSqFt: 19,
    plasterFactor: 1.0,
    wallTexture: 'plaster',
    note: 'প্রচলিত ও মজবুত গাঁথুনি',
  },
  {
    id: 'hollow_block',
    nameBn: 'কংক্রিট হলো ব্লক (Hollow Block)',
    unit: 'পিস (pcs)',
    defaultPrice: 52,
    qtyPerSqFt: 3.6,
    plasterFactor: 0.72,
    wallTexture: 'block',
    note: 'হালকা, তাপরোধী ও প্লাস্টার কম লাগে',
  },
  {
    id: 'aac_block',
    nameBn: 'AAC ব্লক (Autoclaved Aerated)',
    unit: 'পিস (pcs)',
    defaultPrice: 95,
    qtyPerSqFt: 2.1,
    plasterFactor: 0.55,
    wallTexture: 'plaster',
    note: 'অতি হালকা, সাউন্ডপ্রুফ ও দ্রুত কাজ',
  },
];

export const CEMENT_OPTIONS = [
  {
    id: 'pcc_std',
    nameBn: 'PCC সিমেন্ট (Standard Brand)',
    unit: 'বস্তা (bag)',
    defaultPrice: 530,
    qtyPerSqFt: 0.44,
  },
  {
    id: 'opc_prem',
    nameBn: 'OPC / প্রিমিয়াম সিমেন্ট (Shah/Crown/Holcim)',
    unit: 'বস্তা (bag)',
    defaultPrice: 585,
    qtyPerSqFt: 0.44,
  },
];

export const REBAR_OPTIONS = [
  {
    id: 'rod_60g',
    nameBn: '৬০ গ্রেড রড (60 Grade Rebar)',
    unit: 'কেজি (kg)',
    defaultPrice: 92,
    kgPerSqFt: 3.7,
  },
  {
    id: 'rod_500w',
    nameBn: '৫০০W / ৭২.৫ গ্রেড রড (BSRM/AKS/GPH)',
    unit: 'কেজি (kg)',
    defaultPrice: 98,
    kgPerSqFt: 3.9,
  },
];

export const AGGREGATE_OPTIONS = [
  {
    id: 'brick_khoa',
    nameBn: 'ইটের খোয়া (1st Class Brick Chips)',
    unit: 'সিএফটি (cft)',
    defaultPrice: 135,
    cftPerSqFt: 1.32,
  },
  {
    id: 'stone_chips',
    nameBn: 'পাথর কুচি (3/4" Stone Chips)',
    unit: 'সিএফটি (cft)',
    defaultPrice: 215,
    cftPerSqFt: 1.32,
  },
];

export const FINISH_TIERS = [
  {
    id: 'economy',
    nameBn: 'ইকোনমি ফিনিশ (Economy)',
    tilesRatePerSqFt: 85,
    doorWinPerSqFt: 135,
    plumbingPerSqFt: 115,
    electricalPerSqFt: 95,
    paintPerSqFt: 48,
    laborPerSqFt: 320,
  },
  {
    id: 'standard',
    nameBn: 'স্ট্যান্ডার্ড ফিনিশ (Standard)',
    tilesRatePerSqFt: 145,
    doorWinPerSqFt: 215,
    plumbingPerSqFt: 175,
    electricalPerSqFt: 145,
    paintPerSqFt: 72,
    laborPerSqFt: 375,
  },
  {
    id: 'luxury',
    nameBn: 'লাক্সারি ফিনিশ (Luxury)',
    tilesRatePerSqFt: 285,
    doorWinPerSqFt: 360,
    plumbingPerSqFt: 290,
    electricalPerSqFt: 230,
    paintPerSqFt: 115,
    laborPerSqFt: 460,
  },
];

export const FOUNDATION_TYPES = [
  {
    id: 'isolated',
    nameBn: 'আইসোলেটেড ফুটিং (Isolated Footing)',
    soilMatch: 'স্বাভাবিক শক্ত মাটি (Normal Soil)',
    baseCostPerSqFt: 240,
    perFutureFloorAddon: 75,
    extraRebarKgPerSqFt: 0.45,
    extraCementBagPerSqFt: 0.08,
    depthFt: 6,
  },
  {
    id: 'combined',
    nameBn: 'কম্বাইন্ড + গ্রেড বিম (Combined Footing)',
    soilMatch: 'মাঝারি মাটি (Medium Soil)',
    baseCostPerSqFt: 330,
    perFutureFloorAddon: 95,
    extraRebarKgPerSqFt: 0.72,
    extraCementBagPerSqFt: 0.12,
    depthFt: 7.5,
  },
  {
    id: 'mat',
    nameBn: 'ম্যাট / র‍্যাফট ফাউন্ডেশন (Mat / Raft)',
    soilMatch: 'নরম মাটি / কম বিয়ারিং (Soft Clay)',
    baseCostPerSqFt: 490,
    perFutureFloorAddon: 120,
    extraRebarKgPerSqFt: 1.15,
    extraCementBagPerSqFt: 0.19,
    depthFt: 8.5,
  },
  {
    id: 'pile',
    nameBn: 'পাইল ফাউন্ডেশন (Cast-in-Situ Pile)',
    soilMatch: 'ভরাট / নিচু জমি (Filled / Marshy Land)',
    baseCostPerSqFt: 680,
    perFutureFloorAddon: 165,
    extraRebarKgPerSqFt: 1.55,
    extraCementBagPerSqFt: 0.25,
    depthFt: 45,
  },
];

export const SOIL_TYPES = [
  { id: 'normal', nameBn: 'স্বাভাবিক শক্ত মাটি (Normal)', recommendedFoundation: 'isolated' },
  { id: 'medium', nameBn: 'মাঝারি দোআঁশ (Medium)', recommendedFoundation: 'combined' },
  { id: 'soft', nameBn: 'নরম / এঁটেল মাটি (Soft Clay)', recommendedFoundation: 'mat' },
  { id: 'filled', nameBn: 'ভরাট / নিচু জমি (Filled Land)', recommendedFoundation: 'pile' },
];

export const DEFAULT_CUSTOM_RATES = {
  sandCft: 68, // Sylhet + Local blended avg ৳/cft
  masonryPrice: 13.5,
  cementPrice: 550,
  rebarPrice: 98,
  aggregatePrice: 135,
  laborPerSqFt: 375,
};
