export const DEFAULT_PLAN = {
  projectName: 'Client Villa — Plot 24',
  widthFt: 38,
  depthFt: 42,
  floors: 2,
  roofStyle: 'flat', // 'flat' | 'gable' | 'terrace'
  wallColor: '#f3efe6',
  accentColor: '#334155',
  showFurniture: true,
};

export const WALL_SWATCHES = [
  { name: 'Warm Ivory', hex: '#f3efe6' },
  { name: 'Pure White', hex: '#f8fafc' },
  { name: 'Sandstone', hex: '#e5d3b3' },
  { name: 'Slate Mist', hex: '#cbd5e1' },
  { name: 'Charcoal Modern', hex: '#475569' },
];

export const DEFAULT_CAMERA = {
  position: [13.5, 9.8, 14.5],
  target: [0, 1.8, 0],
};

// Base scale: 1 Three.js unit = 4.5 feet
export const FT_TO_UNIT = 1 / 4.5;

export function computeHouseMetrics(plan) {
  const widthUnits = plan.widthFt * FT_TO_UNIT;
  const depthUnits = plan.depthFt * FT_TO_UNIT;

  const groundSqFt = Math.round(plan.widthFt * plan.depthFt);
  const firstSqFt = plan.floors === 2 ? Math.round(plan.widthFt * plan.depthFt * 0.86) : 0;
  const totalSqFt = groundSqFt + firstSqFt;
  const shotok = (totalSqFt / 435.6).toFixed(2);
  const katha = (totalSqFt / 720).toFixed(2);

  const w = plan.widthFt;
  const d = plan.depthFt;

  const groundRooms = [
    {
      id: 'living',
      floor: 'ground',
      label: 'Living & Dining Hall',
      shortName: 'Living Hall',
      dimsFt: `${Math.round(w * 0.56)}' × ${Math.round(d * 0.52)}'`,
      areaSqFt: Math.round(w * 0.56 * d * 0.52),
      accent: '#38bdf8',
      localAnchor: [-widthUnits * 0.2, 1.1, depthUnits * 0.08],
      cameraOffset: [-widthUnits * 0.55, 6.4, depthUnits * 0.95],
      blueprint: { x: 4, y: 34, w: 54, h: 42 },
      description:
        'Open-plan drawing and dining space with L-shaped lounge seating, 6-seater dining table, TV feature wall, and access to the main staircase.',
      features: ['Porcelain Tile Floor', 'Full-Height Windows', 'Open Staircase', 'TV Media Wall'],
    },
    {
      id: 'kitchen',
      floor: 'ground',
      label: 'Modular Kitchen',
      shortName: 'Kitchen',
      dimsFt: `${Math.round(w * 0.4)}' × ${Math.round(d * 0.34)}'`,
      areaSqFt: Math.round(w * 0.4 * d * 0.34),
      accent: '#34d399',
      localAnchor: [widthUnits * 0.26, 1.1, -depthUnits * 0.28],
      cameraOffset: [widthUnits * 0.65, 5.8, -depthUnits * 0.65],
      blueprint: { x: 60, y: 4, w: 36, h: 36 },
      description:
        'L-shaped modular kitchen with granite countertop island, double sink, refrigerator bay, and direct ventilation window.',
      features: ['L-Shape Counter', 'Center Island', 'Appliance Bay', 'Exhaust Window'],
    },
    {
      id: 'guest_bed',
      floor: 'ground',
      label: 'Guest Bedroom',
      shortName: 'Guest Bed',
      dimsFt: `${Math.round(w * 0.44)}' × ${Math.round(d * 0.34)}'`,
      areaSqFt: Math.round(w * 0.44 * d * 0.34),
      accent: '#f472b6',
      localAnchor: [-widthUnits * 0.24, 1.1, -depthUnits * 0.28],
      cameraOffset: [-widthUnits * 0.65, 5.8, -depthUnits * 0.65],
      blueprint: { x: 4, y: 4, w: 42, h: 28 },
      description:
        'Ground-floor bedroom ideal for guests or elders, complete with queen bed, built-in wardrobe, and garden-facing window.',
      features: ['Queen Bed Layout', 'Wall Wardrobe', 'Cross Ventilation', 'Easy Ground Access'],
    },
    {
      id: 'bath_ground',
      floor: 'ground',
      label: 'Common Bath & Utility',
      shortName: 'Washroom',
      dimsFt: `${Math.round(w * 0.16)}' × ${Math.round(d * 0.22)}'`,
      areaSqFt: Math.round(w * 0.16 * d * 0.22),
      accent: '#60a5fa',
      localAnchor: [widthUnits * 0.04, 1.1, -depthUnits * 0.31],
      cameraOffset: [0.4, 5.8, -depthUnits * 0.8],
      blueprint: { x: 47, y: 4, w: 12, h: 28 },
      description:
        'Centrally plumbed common bathroom positioned cleanly between the kitchen wet wall and guest suite.',
      features: ['Glass Shower Zone', 'Vanity Counter', 'Ventilation Shaft', 'Anti-Skid Tile'],
    },
    {
      id: 'porch',
      floor: 'ground',
      label: 'Car Porch & Front Entry',
      shortName: 'Car Porch',
      dimsFt: `${Math.round(w * 0.4)}' × ${Math.round(d * 0.28)}'`,
      areaSqFt: Math.round(w * 0.4 * d * 0.28),
      accent: '#fbbf24',
      localAnchor: [widthUnits * 0.25, 1.0, depthUnits * 0.36],
      cameraOffset: [widthUnits * 0.72, 4.6, depthUnits * 1.15],
      blueprint: { x: 60, y: 44, w: 36, h: 52 },
      description:
        'Covered front entry veranda and shaded driveway porch accommodating a family sedan with landscaped side lawn.',
      features: ['Covered Car Bay', 'Main Entry Foyer', 'Front Garden Lawn', 'Paved Driveway'],
    },
  ];

  const firstRooms =
    plan.floors === 2
      ? [
          {
            id: 'master_suite',
            floor: 'first',
            label: 'Master Bedroom Suite',
            shortName: 'Master Bed',
            dimsFt: `${Math.round(w * 0.48)}' × ${Math.round(d * 0.42)}'`,
            areaSqFt: Math.round(w * 0.48 * d * 0.42),
            accent: '#a78bfa',
            localAnchor: [-widthUnits * 0.22, 3.35, -depthUnits * 0.18],
            cameraOffset: [-widthUnits * 0.72, 8.1, -depthUnits * 0.7],
            blueprint: { x: 4, y: 4, w: 48, h: 44 },
            description:
              'Spacious upper-level master suite with king bed, walk-in wardrobe, and private daylight windows.',
            features: ['King Bed Suite', 'Wardrobe Wall', 'Corner Windows', 'Quiet Upper Zone'],
          },
          {
            id: 'kid_bed',
            floor: 'first',
            label: 'Bedroom 02 & Study',
            shortName: 'Bedroom 2',
            dimsFt: `${Math.round(w * 0.42)}' × ${Math.round(d * 0.38)}'`,
            areaSqFt: Math.round(w * 0.42 * d * 0.38),
            accent: '#f472b6',
            localAnchor: [widthUnits * 0.24, 3.35, -depthUnits * 0.2],
            cameraOffset: [widthUnits * 0.72, 8.1, -depthUnits * 0.7],
            blueprint: { x: 54, y: 4, w: 42, h: 40 },
            description:
              'Second upper bedroom designed with twin/full bed placement, study desk nook, and natural airflow.',
            features: ['Study Desk Nook', 'Built-in Closet', 'Dual Aspect Light', 'Direct Hall Access'],
          },
          {
            id: 'balcony',
            floor: 'first',
            label: 'Family Lounge & Balcony',
            shortName: 'Balcony',
            dimsFt: `${Math.round(w * 0.88)}' × ${Math.round(d * 0.36)}'`,
            areaSqFt: Math.round(w * 0.88 * d * 0.36),
            accent: '#38bdf8',
            localAnchor: [0, 3.35, depthUnits * 0.3],
            cameraOffset: [0.5, 7.6, depthUnits * 1.1],
            blueprint: { x: 4, y: 52, w: 92, h: 42 },
            description:
              'Upper family sitting lounge opening onto a cantilevered glass-railed front terrace overlooking the yard.',
            features: ['Glass Balustrade', 'Sit-out Terrace', 'Family TV Nook', 'Shaded Overhang'],
          },
        ]
      : [];

  return {
    widthUnits,
    depthUnits,
    groundSqFt,
    firstSqFt,
    totalSqFt,
    shotok,
    katha,
    rooms: [...groundRooms, ...firstRooms],
  };
}
