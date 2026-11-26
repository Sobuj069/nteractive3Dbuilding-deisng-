import {
  AGGREGATE_OPTIONS,
  CEMENT_OPTIONS,
  FINISH_TIERS,
  FOUNDATION_TYPES,
  MASONRY_OPTIONS,
  REBAR_OPTIONS,
} from '../data/ingredients.js';

export function formatBDTExact(num) {
  return `৳ ${Math.round(num).toLocaleString('en-IN')}`;
}

export function formatBDTShort(num) {
  if (num >= 10000000) {
    return `৳ ${(num / 10000000).toFixed(2)} কোটি`;
  }
  return `৳ ${(num / 100000).toFixed(1)} লাখ`;
}

export function getColumnGrid(widthFt, depthFt) {
  const colsX = Math.max(3, Math.min(5, Math.round(widthFt / 12) + 1));
  const colsZ = Math.max(3, Math.min(5, Math.round(depthFt / 13) + 1));
  return { colsX, colsZ, totalColumns: colsX * colsZ };
}

/**
 * Calculates full Bangladeshi BOQ material quantities and cost breakdown.
 */
export function calculateBOQ(config) {
  const masonry = MASONRY_OPTIONS.find((m) => m.id === config.masonryId) || MASONRY_OPTIONS[0];
  const cement = CEMENT_OPTIONS.find((c) => c.id === config.cementId) || CEMENT_OPTIONS[0];
  const rebar = REBAR_OPTIONS.find((r) => r.id === config.rebarId) || REBAR_OPTIONS[1];
  const aggregate = AGGREGATE_OPTIONS.find((a) => a.id === config.aggregateId) || AGGREGATE_OPTIONS[0];
  const finish = FINISH_TIERS.find((f) => f.id === config.finishTierId) || FINISH_TIERS[1];
  const foundation = FOUNDATION_TYPES.find((f) => f.id === config.foundationType) || FOUNDATION_TYPES[0];

  const widthFt = Number(config.widthFt);
  const depthFt = Number(config.depthFt);
  const floors = Math.max(1, Math.min(4, Number(config.floors)));
  const foundationFloors = Math.max(floors, Math.min(6, Number(config.foundationFloors)));

  const groundSqFt = Math.round(widthFt * depthFt);
  // Upper floors ~92% footprint efficiency (balcony/cutouts)
  const upperSqFt = floors > 1 ? Math.round(groundSqFt * 0.92 * (floors - 1)) : 0;
  const totalSqFt = groundSqFt + upperSqFt;

  const plotShotok = (groundSqFt / 435.6).toFixed(2);
  const plotKatha = (groundSqFt / 720).toFixed(2);
  const colGrid = getColumnGrid(widthFt, depthFt);

  const rates = config.rates;
  const futureExtraFloors = Math.max(0, foundationFloors - floors);

  // Material Quantities
  const masonryQty = Math.round(totalSqFt * masonry.qtyPerSqFt);
  const cementBags = Math.round(
    totalSqFt * cement.qtyPerSqFt * masonry.plasterFactor +
      groundSqFt * foundation.extraCementBagPerSqFt * (1 + futureExtraFloors * 0.35)
  );
  const rebarKg = Math.round(
    totalSqFt * rebar.kgPerSqFt +
      groundSqFt * foundation.extraRebarKgPerSqFt * (1 + futureExtraFloors * 0.45)
  );
  const sandCft = Math.round(totalSqFt * 1.85 * masonry.plasterFactor + groundSqFt * 0.45);
  const aggregateCft = Math.round(totalSqFt * aggregate.cftPerSqFt + groundSqFt * 0.38);

  // Cost lines
  const masonryCost = Math.round(masonryQty * rates.masonryPrice);
  const cementCost = Math.round(cementBags * rates.cementPrice);
  const rebarCost = Math.round(rebarKg * rates.rebarPrice);
  const sandCost = Math.round(sandCft * rates.sandCft);
  const aggregateCost = Math.round(aggregateCft * rates.aggregatePrice);

  const foundationExecutionCost = Math.round(
    groundSqFt *
      (foundation.baseCostPerSqFt + futureExtraFloors * foundation.perFutureFloorAddon)
  );

  const tilesCost = Math.round(totalSqFt * finish.tilesRatePerSqFt);
  const doorWinCost = Math.round(totalSqFt * finish.doorWinPerSqFt);
  const mepCost = Math.round(totalSqFt * (finish.plumbingPerSqFt + finish.electricalPerSqFt));
  const paintCost = Math.round(totalSqFt * finish.paintPerSqFt * masonry.plasterFactor);
  const laborCost = Math.round(totalSqFt * rates.laborPerSqFt);

  const items = [
    {
      key: 'masonry',
      label: masonry.nameBn,
      qty: `${masonryQty.toLocaleString('en-IN')} ${masonry.unit}`,
      rate: `৳ ${rates.masonryPrice}`,
      cost: masonryCost,
    },
    {
      key: 'cement',
      label: cement.nameBn,
      qty: `${cementBags.toLocaleString('en-IN')} বস্তা`,
      rate: `৳ ${rates.cementPrice}`,
      cost: cementCost,
    },
    {
      key: 'rebar',
      label: rebar.nameBn,
      qty: `${rebarKg.toLocaleString('en-IN')} কেজি (${(rebarKg / 1000).toFixed(2)} টন)`,
      rate: `৳ ${rates.rebarPrice}`,
      cost: rebarCost,
    },
    {
      key: 'sand',
      label: 'সিলেট ও লোকাল বালু (Sand)',
      qty: `${sandCft.toLocaleString('en-IN')} সিএফটি`,
      rate: `৳ ${rates.sandCft}`,
      cost: sandCost,
    },
    {
      key: 'aggregate',
      label: aggregate.nameBn,
      qty: `${aggregateCft.toLocaleString('en-IN')} সিএফটি`,
      rate: `৳ ${rates.aggregatePrice}`,
      cost: aggregateCost,
    },
    {
      key: 'foundation',
      label: `ফাউন্ডেশন ও আর্থ-ওয়ার্ক (${foundation.nameBn.split(' ')[0]} • ${foundationFloors}F)`,
      qty: `${colGrid.totalColumns} কলাম • ${foundation.depthFt}ft গভীরতা`,
      rate: `৳ ${foundation.baseCostPerSqFt + futureExtraFloors * foundation.perFutureFloorAddon}/sqft`,
      cost: foundationExecutionCost,
    },
    {
      key: 'tiles',
      label: `ফ্লোর টাইলস ও ফিনিশ (${finish.nameBn.split(' ')[0]})`,
      qty: `${totalSqFt.toLocaleString('en-IN')} sq ft`,
      rate: `৳ ${finish.tilesRatePerSqFt}/sqft`,
      cost: tilesCost,
    },
    {
      key: 'doors',
      label: 'দরজা, জানালা ও গ্রিল (Doors & Windows)',
      qty: `${totalSqFt.toLocaleString('en-IN')} sq ft`,
      rate: `৳ ${finish.doorWinPerSqFt}/sqft`,
      cost: doorWinCost,
    },
    {
      key: 'mep',
      label: 'স্যানিটারি ও ইলেকট্রিক্যাল (Plumbing + Electric)',
      qty: `${totalSqFt.toLocaleString('en-IN')} sq ft`,
      rate: `৳ ${finish.plumbingPerSqFt + finish.electricalPerSqFt}/sqft`,
      cost: mepCost,
    },
    {
      key: 'paint',
      label: 'প্লাস্টার ফিনিশ ও রং (Paint & WeatherCoat)',
      qty: `${totalSqFt.toLocaleString('en-IN')} sq ft`,
      rate: `৳ ${finish.paintPerSqFt}/sqft`,
      cost: paintCost,
    },
    {
      key: 'labor',
      label: 'রাজমিস্ত্রি ও কন্ট্রাক্টর লেবার (Mason Labor)',
      qty: `${totalSqFt.toLocaleString('en-IN')} sq ft`,
      rate: `৳ ${rates.laborPerSqFt}/sqft`,
      cost: laborCost,
    },
  ];

  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
  const costPerSqFt = Math.round(totalCost / Math.max(1, totalSqFt));
  const budgetBDT = Number(config.budgetLakh) * 100000;
  const withinBudget = totalCost <= budgetBDT;
  const diffBDT = budgetBDT - totalCost;
  const maxAffordableSqFt = Math.max(500, Math.floor(budgetBDT / Math.max(1200, costPerSqFt)));

  return {
    groundSqFt,
    totalSqFt,
    plotShotok,
    plotKatha,
    colGrid,
    foundationDepthFt: foundation.depthFt,
    items,
    totalCost,
    costPerSqFt,
    budgetBDT,
    withinBudget,
    diffBDT,
    maxAffordableSqFt,
  };
}

/**
 * Quick estimate for filtering and labeling each of the 45 plans against the user's selected ingredients & budget.
 */
export function estimatePlanCost(planTemplate, currentConfig) {
  return calculateBOQ({
    ...currentConfig,
    widthFt: planTemplate.widthFt,
    depthFt: planTemplate.depthFt,
    floors: planTemplate.floors,
    foundationFloors: Math.max(planTemplate.floors, planTemplate.foundationFloors),
  });
}
