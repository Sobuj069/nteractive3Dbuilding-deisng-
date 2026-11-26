/**
 * 45 Parametric Bangladeshi House Floor Plan Templates
 * Categories:
 *  - small  : ছোট জমি (২–৩ শতক) — 12 Plans
 *  - medium : মাঝারি জমি (৩–৫ শতক) — 15 Plans
 *  - large  : বড় জমি ও মাল্টি-ইউনিট (৫–৮ শতক) — 10 Plans
 *  - eco    : কম বাজেট / ব্লক বাড়ি (Eco & Budget) — 8 Plans
 */

// Reusable architectural room archetypes (percent-based 0..100 coordinates on plan)
const ARCHETYPES = {
  compact_2bed: {
    ground: [
      { id: 'guest_bed', type: 'bedroom', nameBn: 'বেডরুম ১', nameEn: 'Bed 1', x: 4, y: 4, w: 44, h: 38, accent: '#f472b6' },
      { id: 'bath_1', type: 'bath', nameBn: 'বাথরুম', nameEn: 'Bath', x: 49, y: 4, w: 16, h: 38, accent: '#60a5fa' },
      { id: 'kitchen', type: 'kitchen', nameBn: 'কিচেন', nameEn: 'Kitchen', x: 66, y: 4, w: 30, h: 38, accent: '#34d399' },
      { id: 'living', type: 'living', nameBn: 'ড্রয়িং ও ডাইনিং', nameEn: 'Living', x: 4, y: 44, w: 58, h: 52, accent: '#38bdf8' },
      { id: 'porch', type: 'porch', nameBn: 'বারান্দা / এন্ট্রি', nameEn: 'Veranda', x: 64, y: 44, w: 32, h: 52, accent: '#fbbf24' },
    ],
    upper: [
      { id: 'master_bed', type: 'bedroom', nameBn: 'মাস্টার বেড', nameEn: 'Master', x: 4, y: 4, w: 48, h: 46, accent: '#a78bfa' },
      { id: 'bed_2', type: 'bedroom', nameBn: 'বেডরুম ২', nameEn: 'Bed 2', x: 54, y: 4, w: 42, h: 46, accent: '#f472b6' },
      { id: 'balcony', type: 'balcony', nameBn: 'ফ্যামিলি লাউঞ্জ ও বারান্দা', nameEn: 'Balcony', x: 4, y: 52, w: 92, h: 44, accent: '#38bdf8' },
    ],
  },
  duplex_3bed: {
    ground: [
      { id: 'guest_bed', type: 'bedroom', nameBn: 'গেস্ট বেডরুম', nameEn: 'Guest Bed', x: 4, y: 4, w: 42, h: 34, accent: '#f472b6' },
      { id: 'bath_1', type: 'bath', nameBn: 'কমন বাথ', nameEn: 'Bath', x: 47, y: 4, w: 13, h: 34, accent: '#60a5fa' },
      { id: 'kitchen', type: 'kitchen', nameBn: 'মডুলার কিচেন', nameEn: 'Kitchen', x: 62, y: 4, w: 34, h: 34, accent: '#34d399' },
      { id: 'living', type: 'living', nameBn: 'লিভিং ও ডাইনিং হল', nameEn: 'Living Hall', x: 4, y: 40, w: 56, h: 56, accent: '#38bdf8' },
      { id: 'porch', type: 'porch', nameBn: 'কার পোর্চ ও গেট', nameEn: 'Car Porch', x: 62, y: 40, w: 34, h: 56, accent: '#fbbf24' },
    ],
    upper: [
      { id: 'master_bed', type: 'bedroom', nameBn: 'মাস্টার স্যুট', nameEn: 'Master Suite', x: 4, y: 4, w: 48, h: 48, accent: '#a78bfa' },
      { id: 'bed_2', type: 'bedroom', nameBn: 'বেডরুম ২ ও স্টাডি', nameEn: 'Bed 2', x: 54, y: 4, w: 42, h: 48, accent: '#f472b6' },
      { id: 'balcony', type: 'balcony', nameBn: 'ফ্যামিলি সিটিং ও ব্যালকনি', nameEn: 'Terrace', x: 4, y: 54, w: 92, h: 42, accent: '#38bdf8' },
    ],
  },
  family_4bed: {
    ground: [
      { id: 'bed_g1', type: 'bedroom', nameBn: 'বেডরুম ১', nameEn: 'Bed 1', x: 4, y: 4, w: 34, h: 34, accent: '#f472b6' },
      { id: 'bath_1', type: 'bath', nameBn: 'বাথ ১', nameEn: 'Bath 1', x: 39, y: 4, w: 12, h: 34, accent: '#60a5fa' },
      { id: 'bed_g2', type: 'bedroom', nameBn: 'বেডরুম ২', nameEn: 'Bed 2', x: 52, y: 4, w: 22, h: 34, accent: '#a78bfa' },
      { id: 'kitchen', type: 'kitchen', nameBn: 'কিচেন', nameEn: 'Kitchen', x: 75, y: 4, w: 21, h: 34, accent: '#34d399' },
      { id: 'living', type: 'living', nameBn: 'বড় ড্রয়িং ও ডাইনিং', nameEn: 'Grand Living', x: 4, y: 40, w: 62, h: 56, accent: '#38bdf8' },
      { id: 'porch', type: 'porch', nameBn: 'গ্যারেজ ও ফয়েয়ার', nameEn: 'Garage', x: 68, y: 40, w: 28, h: 56, accent: '#fbbf24' },
    ],
    upper: [
      { id: 'master_bed', type: 'bedroom', nameBn: 'মাস্টার বেড', nameEn: 'Master', x: 4, y: 4, w: 42, h: 46, accent: '#a78bfa' },
      { id: 'bed_u2', type: 'bedroom', nameBn: 'বেডরুম ৩', nameEn: 'Bed 3', x: 48, y: 4, w: 26, h: 46, accent: '#f472b6' },
      { id: 'bed_u3', type: 'bedroom', nameBn: 'বেডরুম ৪', nameEn: 'Bed 4', x: 75, y: 4, w: 21, h: 46, accent: '#34d399' },
      { id: 'balcony', type: 'balcony', nameBn: 'ওপেন লাউঞ্জ ও বারান্দা', nameEn: 'Sky Lounge', x: 4, y: 52, w: 92, h: 44, accent: '#38bdf8' },
    ],
  },
  dual_unit: {
    ground: [
      { id: 'unit_a_bed', type: 'bedroom', nameBn: 'ইউনিট-A বেড', nameEn: 'Unit A Bed', x: 4, y: 4, w: 42, h: 36, accent: '#f472b6' },
      { id: 'unit_b_bed', type: 'bedroom', nameBn: 'ইউনিট-B বেড', nameEn: 'Unit B Bed', x: 54, y: 4, w: 42, h: 36, accent: '#a78bfa' },
      { id: 'living', type: 'living', nameBn: 'ইউনিট-A লিভিং ও কিচেন', nameEn: 'Unit A Hall', x: 4, y: 42, w: 42, h: 54, accent: '#38bdf8' },
      { id: 'bath_1', type: 'bath', nameBn: 'সিঁড়ি ও কোর', nameEn: 'Stair Core', x: 47, y: 4, w: 6, h: 92, accent: '#60a5fa' },
      { id: 'porch', type: 'porch', nameBn: 'ইউনিট-B ও পার্কিং', nameEn: 'Unit B / Park', x: 54, y: 42, w: 42, h: 54, accent: '#fbbf24' },
    ],
    upper: [
      { id: 'master_bed', type: 'bedroom', nameBn: 'ইউনিট-A (2BHK)', nameEn: 'Unit A', x: 4, y: 4, w: 44, h: 54, accent: '#a78bfa' },
      { id: 'bed_2', type: 'bedroom', nameBn: 'ইউনিট-B (2BHK)', nameEn: 'Unit B', x: 52, y: 4, w: 44, h: 54, accent: '#f472b6' },
      { id: 'balcony', type: 'balcony', nameBn: 'সামনের ডুয়েল বারান্দা', nameEn: 'Dual Balcony', x: 4, y: 60, w: 92, h: 36, accent: '#38bdf8' },
    ],
  },
  village_courtyard: {
    ground: [
      { id: 'bed_1', type: 'bedroom', nameBn: 'মাস্টার রুম', nameEn: 'Master Room', x: 4, y: 4, w: 32, h: 42, accent: '#a78bfa' },
      { id: 'bed_2', type: 'bedroom', nameBn: 'বেডরুম ২', nameEn: 'Bed 2', x: 38, y: 4, w: 30, h: 42, accent: '#f472b6' },
      { id: 'kitchen', type: 'kitchen', nameBn: 'রান্নাঘর', nameEn: 'Kitchen', x: 70, y: 4, w: 26, h: 42, accent: '#34d399' },
      { id: 'living', type: 'living', nameBn: 'বড় বৈঠকখানা ও ডাইনিং', nameEn: 'Living Room', x: 4, y: 48, w: 64, h: 48, accent: '#38bdf8' },
      { id: 'porch', type: 'porch', nameBn: 'সামনের প্রশস্ত বারান্দা', nameEn: 'Front Veranda', x: 70, y: 48, w: 26, h: 48, accent: '#fbbf24' },
    ],
    upper: [
      { id: 'master_bed', type: 'bedroom', nameBn: 'উপরের বেড ১', nameEn: 'Upper Bed 1', x: 4, y: 4, w: 46, h: 46, accent: '#a78bfa' },
      { id: 'bed_u2', type: 'bedroom', nameBn: 'উপরের বেড ২', nameEn: 'Upper Bed 2', x: 52, y: 4, w: 44, h: 46, accent: '#f472b6' },
      { id: 'balcony', type: 'balcony', nameBn: 'খোলা ছাদ ও বারান্দা', nameEn: 'Open Terrace', x: 4, y: 52, w: 92, h: 44, accent: '#38bdf8' },
    ],
  },
};

const RAW_PLANS = [
  // === 12 SMALL PLOT PLANS (২–৩ শতক) ===
  ['pln-01', '২ শতকে স্মার্ট ১ তলা হোম', 'Smart 2-Shotok 1-Story', 'small', 28, 32, 1, 2, 2, 1, 'দক্ষিণ', 'compact_2bed', 'ext-01', 'flr-01'],
  ['pln-02', '২.৫ শতকে কমপ্যাক্ট ডুপ্লেক্স', 'Compact 2.5-Shotok Duplex', 'small', 30, 36, 2, 4, 3, 2, 'পূর্ব', 'compact_2bed', 'ext-03', 'flr-02'],
  ['pln-03', 'শহরের ন্যারো প্লট (26×42)', 'Urban Narrow Plot Home', 'small', 26, 42, 2, 3, 3, 2, 'দক্ষিণ', 'duplex_3bed', 'ext-11', 'flr-04'],
  ['pln-04', '৩ শতকে আধুনিক ৩ বেডরুম', 'Modern 3-Bed on 3 Shotok', 'small', 32, 38, 1, 3, 2, 2, 'উত্তর', 'village_courtyard', 'ext-05', 'flr-06'],
  ['pln-05', '২ শতকে ফিউচার ৪-তলা ফাউন্ডেশন', 'Expandable 1-on-4 Foundation', 'small', 28, 34, 1, 4, 2, 2, 'পূর্ব', 'compact_2bed', 'ext-04', 'flr-01'],
  ['pln-06', 'কমপ্যাক্ট গ্লাস ডুপ্লেক্স ভিলা', 'Compact Glass Duplex', 'small', 30, 38, 2, 3, 3, 2, 'দক্ষিণ', 'duplex_3bed', 'ext-17', 'flr-03'],
  ['pln-07', 'ছোট ফ্যামিলি ২-বেড কটেজ', 'Cozy 2-Bed Cottage', 'small', 26, 32, 1, 2, 2, 1, 'পশ্চিম', 'compact_2bed', 'ext-16', 'flr-15'],
  ['pln-08', '২.৫ শতকে রুফটপ গার্ডেন হোম', 'Rooftop Garden 2.5 Shotok', 'small', 30, 35, 2, 3, 3, 2, 'দক্ষিণ', 'compact_2bed', 'ext-13', 'flr-11'],
  ['pln-09', 'আধুনিক কর্নার প্লট ডুপ্লেক্স', 'Corner Plot Mini Duplex', 'small', 32, 34, 2, 3, 4, 2, 'পূর্ব', 'duplex_3bed', 'ext-06', 'flr-08'],
  ['pln-10', '৩ শতকে ৩ তলা ফ্যামিলি ভবন', '3-Story Compact Residential', 'small', 32, 40, 3, 4, 6, 4, 'উত্তর', 'dual_unit', 'ext-15', 'flr-05'],
  ['pln-11', 'মিনিমাল হোয়াইট ২-তলা হোম', 'Minimal White 2-Story', 'small', 28, 38, 2, 3, 3, 2, 'দক্ষিণ', 'duplex_3bed', 'ext-21', 'flr-21'],
  ['pln-12', '৩ শতকে গ্রামে আধুনিক ১ তলা', 'Modern Village 1-Story', 'small', 34, 36, 1, 2, 3, 2, 'পূর্ব', 'village_courtyard', 'ext-09', 'flr-09'],

  // === 15 MEDIUM PLOT PLANS (৩–৫ শতক) ===
  ['pln-13', 'ক্লায়েন্ট ডুপ্লেক্স ভিলা (38×42)', 'Signature Duplex Villa', 'medium', 38, 42, 2, 3, 4, 3, 'দক্ষিণ', 'duplex_3bed', 'ext-01', 'flr-01'],
  ['pln-14', '৪ শতকে লাল ইটের ডুপ্লেক্স', 'Red Brick Exposed Duplex', 'medium', 40, 42, 2, 3, 4, 3, 'পূর্ব', 'duplex_3bed', 'ext-02', 'flr-14'],
  ['pln-15', '৪ শতকে ৪ বেডরুম ১ তলা বাংলো', '4-Bed Single Story Bungalow', 'medium', 42, 40, 1, 2, 4, 3, 'দক্ষিণ', 'family_4bed', 'ext-05', 'flr-06'],
  ['pln-16', 'ঢাকা সাবআর্ব লাক্সারি ডুপ্লেক্স', 'Suburban Luxury Duplex', 'medium', 40, 46, 2, 4, 5, 4, 'উত্তর', 'family_4bed', 'ext-08', 'flr-02'],
  ['pln-17', '৩.৫ শতকে ডুয়েল-ইউনিট ৩ তলা', 'Dual-Unit 3-Story Rental', 'medium', 36, 44, 3, 5, 6, 4, 'পূর্ব', 'dual_unit', 'ext-10', 'flr-05'],
  ['pln-18', '৫ শতকে গ্রিন ব্যালকনি ভিলা', 'Green Balcony Eco Villa', 'medium', 44, 46, 2, 3, 5, 4, 'দক্ষিণ', 'family_4bed', 'ext-04', 'flr-12'],
  ['pln-19', 'কার পোর্চ ও লাউঞ্জ ডুপ্লেক্স', 'Car Porch Modern Duplex', 'medium', 38, 44, 2, 3, 4, 3, 'পশ্চিম', 'duplex_3bed', 'ext-06', 'flr-03'],
  ['pln-20', '৪ শতকে ৩ তলা ফ্যামিলি বাড়ি', '3-Story Family Residence', 'medium', 40, 44, 3, 5, 6, 4, 'দক্ষিণ', 'duplex_3bed', 'ext-20', 'flr-02'],
  ['pln-21', 'সিলেট স্টাইল গ্যাবল ডুপ্লেক্স', 'Sylhet Gable Roof Duplex', 'medium', 42, 44, 2, 2, 4, 3, 'পূর্ব', 'village_courtyard', 'ext-09', 'flr-08'],
  ['pln-22', 'রয়্যাল পিলার ফ্রন্ট ডুপ্লেক্স', 'Royal Pillar Classic Duplex', 'medium', 42, 46, 2, 3, 5, 4, 'দক্ষিণ', 'family_4bed', 'ext-10', 'flr-06'],
  ['pln-23', '৪.৫ শতকে ৪ তলা অ্যাপার্টমেন্ট', '4-Story Dual Unit Building', 'medium', 40, 48, 4, 6, 8, 6, 'উত্তর', 'dual_unit', 'ext-21', 'flr-04'],
  ['pln-24', 'আধুনিক স্কাই-টেরেস ভিলা', 'Sky Terrace Modern Home', 'medium', 38, 46, 2, 3, 4, 3, 'পূর্ব', 'duplex_3bed', 'ext-18', 'flr-17'],
  ['pln-25', '৩.৫ শতকে প্রশস্ত উঠান বাড়ি', 'Spacious Courtyard Home', 'medium', 38, 40, 1, 2, 3, 2, 'দক্ষিণ', 'village_courtyard', 'ext-14', 'flr-09'],
  ['pln-26', 'মেডিটেরেনিয়ান ডুপ্লেক্স হোম', 'Mediterranean Family Villa', 'medium', 44, 44, 2, 3, 5, 4, 'দক্ষিণ', 'family_4bed', 'ext-14', 'flr-18'],
  ['pln-27', 'চট্টগ্রাম হিল-ভিউ ডুপ্লেক্স', 'Hill-View Timber Duplex', 'medium', 40, 42, 2, 3, 4, 3, 'পূর্ব', 'duplex_3bed', 'ext-24', 'flr-10'],

  // === 10 LARGE PLOT & MULTI-UNIT PLANS (৫–৮ শতক) ===
  ['pln-28', '৬ শতকে গ্র্যান্ড লাক্সারি ম্যানশন', 'Grand Luxury 6-Shotok Villa', 'large', 50, 52, 2, 3, 6, 5, 'দক্ষিণ', 'family_4bed', 'ext-23', 'flr-02'],
  ['pln-29', '৫.৫ শতকে ৪ তলা ডুয়েল-ইউনিট', '4-Story Dual Flat Complex', 'large', 46, 52, 4, 6, 8, 6, 'পূর্ব', 'dual_unit', 'ext-03', 'flr-01'],
  ['pln-30', '৭ শতকে রিসোর্ট স্টাইল ভিলা', 'Resort Style Garden Villa', 'large', 54, 54, 2, 3, 6, 5, 'দক্ষিণ', 'family_4bed', 'ext-08', 'flr-09'],
  ['pln-31', '৬ শতকে ৩ তলা যৌথ পরিবার বাড়ি', '3-Story Joint Family Home', 'large', 48, 52, 3, 5, 7, 5, 'উত্তর', 'family_4bed', 'ext-20', 'flr-06'],
  ['pln-32', '৮ শতকে গ্র্যান্ড ১ তলা বাংলো', 'Grand 1-Story Country Estate', 'large', 56, 54, 1, 2, 5, 4, 'পূর্ব', 'family_4bed', 'ext-09', 'flr-03'],
  ['pln-33', '৫ শতকে চারকোল এক্সিকিউটিভ ভিলা', 'Charcoal Executive Duplex', 'large', 46, 48, 2, 4, 5, 4, 'দক্ষিণ', 'family_4bed', 'ext-06', 'flr-19'],
  ['pln-34', '৬ শতকে ৪ তলা কমার্শিয়াল+হোম', 'Mixed-Use 4-Story Building', 'large', 48, 54, 4, 6, 8, 6, 'পশ্চিম', 'dual_unit', 'ext-15', 'flr-04'],
  ['pln-35', '৫.৫ শতকে টেরাকোটা আর্কিটেক্ট ভিলা', 'Terracotta Architect Villa', 'large', 48, 50, 2, 3, 5, 4, 'দক্ষিণ', 'family_4bed', 'ext-12', 'flr-14'],
  ['pln-36', '৭ শতকে ৩ তলা লাক্সারি ডুপ্লেক্স+', '3-Story Triplex Signature', 'large', 52, 52, 3, 4, 7, 6, 'পূর্ব', 'family_4bed', 'ext-17', 'flr-10'],
  ['pln-37', '৬ শতকে পার্ল গ্লাস ম্যানশন', 'Pearl Glass Mansion', 'large', 50, 50, 2, 4, 6, 5, 'দক্ষিণ', 'family_4bed', 'ext-20', 'flr-02'],

  // === 8 ECO / BUDGET / BLOCK HOME PLANS (কম বাজেট ও ব্লক বাড়ি) ===
  ['pln-38', 'কম বাজেটে হলো-ব্লক ১ তলা বাড়ি', 'Budget Hollow Block 1-Story', 'eco', 28, 30, 1, 2, 2, 1, 'পূর্ব', 'compact_2bed', 'ext-07', 'flr-04'],
  ['pln-39', '১৫–২০ লাখে স্মার্ট ভিলেজ হোম', 'Smart Budget Village Home', 'eco', 26, 30, 1, 1, 2, 1, 'দক্ষিণ', 'compact_2bed', 'ext-22', 'flr-05'],
  ['pln-40', 'AAC ব্লকে ইকো ২ তলা হোম', 'AAC Block Eco 2-Story', 'eco', 32, 36, 2, 3, 3, 2, 'দক্ষিণ', 'compact_2bed', 'ext-13', 'flr-16'],
  ['pln-41', 'কম খরচে আধুনিক টালি-ছাদ বাড়ি', 'Low-Cost Sloped Roof Home', 'eco', 30, 34, 1, 1, 3, 2, 'পূর্ব', 'village_courtyard', 'ext-05', 'flr-15'],
  ['pln-42', 'বাজেট ফ্রেন্ডলি ৩-বেড ব্লক বাড়ি', '3-Bed Hollow Block Home', 'eco', 34, 36, 1, 2, 3, 2, 'উত্তর', 'village_courtyard', 'ext-07', 'flr-01'],
  ['pln-43', 'পোড়ামাটি ইকো-ফ্রেন্ডলি কটেজ', 'Exposed Brick Eco Cottage', 'eco', 30, 32, 1, 2, 2, 2, 'দক্ষিণ', 'compact_2bed', 'ext-19', 'flr-14'],
  ['pln-44', 'হলো ব্লকে ২ তলা ফ্যামিলি ডুপ্লেক্স', 'Hollow Block 2-Story Duplex', 'eco', 34, 38, 2, 4, 4, 3, 'পূর্ব', 'duplex_3bed', 'ext-07', 'flr-11'],
  ['pln-45', 'মিনিমাল মিন্ট ১ তলা (৪-তলা বেস)', 'Budget 1-Story on 4F Base', 'eco', 32, 34, 1, 4, 2, 2, 'দক্ষিণ', 'compact_2bed', 'ext-22', 'flr-01'],
];

export const PLAN_CATEGORIES = [
  { id: 'all', labelBn: 'সব (45)' },
  { id: 'budget', labelBn: 'বাজেটের ভেতর' },
  { id: 'small', labelBn: '২–৩ শতক' },
  { id: 'medium', labelBn: '৩–৫ শতক' },
  { id: 'large', labelBn: '৫+ শতক' },
  { id: 'eco', labelBn: 'কম বাজেট / ব্লক' },
];

export const PLANS_LIBRARY = RAW_PLANS.map(
  ([
    id,
    nameBn,
    nameEn,
    category,
    widthFt,
    depthFt,
    floors,
    foundationFloors,
    bedrooms,
    bathrooms,
    facing,
    archetypeKey,
    defaultExteriorId,
    defaultFloorDesignId,
  ]) => ({
    id,
    nameBn,
    nameEn,
    category,
    widthFt,
    depthFt,
    floors,
    foundationFloors,
    bedrooms,
    bathrooms,
    facing,
    archetypeKey,
    rooms: ARCHETYPES[archetypeKey],
    defaultExteriorId,
    defaultFloorDesignId,
  })
);
