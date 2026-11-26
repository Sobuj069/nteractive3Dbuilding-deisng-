/**
 * 45 Architectural Designs Library:
 * - 24 Exterior Facade & Roof Styles
 * - 21 Interior Floor & Tile Designs
 */

export const EXTERIOR_DESIGNS = [
  { id: 'ext-01', name: 'Modern Ivory Minimal', nameBn: 'মডার্ন আইভরি মিনিমাল', category: 'Modern', wallColor: '#f4f0e8', accentColor: '#334155', frameColor: '#1e293b', roofStyle: 'flat', wallPattern: 'plaster', louvers: true, porchColumns: 'square' },
  { id: 'ext-02', name: 'BD Red Brick Exposed', nameBn: 'লাল ইট এক্সপোজড (BD Eco)', category: 'Brick', wallColor: '#a64b37', accentColor: '#292524', frameColor: '#1c1917', roofStyle: 'flat', wallPattern: 'brick', louvers: true, porchColumns: 'square' },
  { id: 'ext-03', name: 'Pure White Glass Box', nameBn: 'পিওর হোয়াইট গ্লাস ডুপ্লেক্স', category: 'Modern', wallColor: '#f8fafc', accentColor: '#0284c7', frameColor: '#0f172a', roofStyle: 'flat', wallPattern: 'plaster', louvers: false, porchColumns: 'round' },
  { id: 'ext-04', name: 'Dhaka Terrace Garden', nameBn: 'ঢাকা রুফ গার্ডেন ভিলা', category: 'Eco', wallColor: '#ece7dd', accentColor: '#3f6212', frameColor: '#1f2937', roofStyle: 'terrace', wallPattern: 'plaster', louvers: true, porchColumns: 'square' },
  { id: 'ext-05', name: 'Village Classic Gable', nameBn: 'আধুনিক গ্রামের টালি ছাদ', category: 'Classic', wallColor: '#f5ebd8', accentColor: '#7c2d12', frameColor: '#431407', roofStyle: 'gable', wallPattern: 'plaster', louvers: false, porchColumns: 'round' },
  { id: 'ext-06', name: 'Charcoal & Teak Wood', nameBn: 'চারকোল ও সেগুন উড লাক্সারি', category: 'Luxury', wallColor: '#475569', accentColor: '#92400e', frameColor: '#0f172a', roofStyle: 'flat', wallPattern: 'plaster', louvers: true, porchColumns: 'square' },
  { id: 'ext-07', name: 'Hollow Block Industrial', nameBn: 'হলো ব্লক ইন্ডাস্ট্রিয়াল লুক', category: 'Brick', wallColor: '#cbd5e1', accentColor: '#1e293b', frameColor: '#0f172a', roofStyle: 'flat', wallPattern: 'block', louvers: true, porchColumns: 'square' },
  { id: 'ext-08', name: 'Sandstone Resort Villa', nameBn: 'স্যান্ডস্টোন রিসোর্ট স্টাইল', category: 'Luxury', wallColor: '#e2cea9', accentColor: '#57534e', frameColor: '#292524', roofStyle: 'terrace', wallPattern: 'plaster', louvers: true, porchColumns: 'round' },
  { id: 'ext-09', name: 'Sylhet Tea-Estate Bungalow', nameBn: 'সিলেট টি-এস্টেট বাংলো', category: 'Classic', wallColor: '#faf7f0', accentColor: '#166534', frameColor: '#14532d', roofStyle: 'gable', wallPattern: 'plaster', louvers: false, porchColumns: 'round' },
  { id: 'ext-10', name: 'Royal Cream & Gold Trim', nameBn: 'রয়্যাল ক্রিম ও গোল্ড ট্রিম', category: 'Classic', wallColor: '#f7efd9', accentColor: '#b45309', frameColor: '#451a03', roofStyle: 'flat', wallPattern: 'plaster', louvers: false, porchColumns: 'round' },
  { id: 'ext-11', name: 'Nordic Slate Duplex', nameBn: 'নর্ডিক স্লেট মডার্ন', category: 'Modern', wallColor: '#d1d9e2', accentColor: '#0f172a', frameColor: '#020617', roofStyle: 'gable', wallPattern: 'plaster', louvers: true, porchColumns: 'square' },
  { id: 'ext-12', name: 'Terracotta Courtyard', nameBn: 'টেরাকোটা উঠান বাড়ি', category: 'Brick', wallColor: '#c2694f', accentColor: '#44403c', frameColor: '#292524', roofStyle: 'terrace', wallPattern: 'brick', louvers: true, porchColumns: 'square' },
  { id: 'ext-13', name: 'Sage Green Eco Home', nameBn: 'সেজ গ্রিন ইকো হোম', category: 'Eco', wallColor: '#d9e3d8', accentColor: '#365314', frameColor: '#1e293b', roofStyle: 'terrace', wallPattern: 'plaster', louvers: true, porchColumns: 'square' },
  { id: 'ext-14', name: 'Mediterranean Peach', nameBn: 'মেডিটেরেনিয়ান পিচ ভিলা', category: 'Classic', wallColor: '#f2d3be', accentColor: '#9a3412', frameColor: '#431407', roofStyle: 'gable', wallPattern: 'plaster', louvers: false, porchColumns: 'round' },
  { id: 'ext-15', name: 'Urban Concrete Brutalist', nameBn: 'আরবান কংক্রিট মিনিমাল', category: 'Modern', wallColor: '#94a3b8', accentColor: '#1e293b', frameColor: '#020617', roofStyle: 'flat', wallPattern: 'block', louvers: true, porchColumns: 'square' },
  { id: 'ext-16', name: 'Sky Blue Coastal Cottage', nameBn: 'স্কাই ব্লু কোস্টাল কটেজ', category: 'Classic', wallColor: '#e0f2fe', accentColor: '#0369a1', frameColor: '#0c4a6e', roofStyle: 'gable', wallPattern: 'plaster', louvers: false, porchColumns: 'round' },
  { id: 'ext-17', name: 'Mocha & Glass Contemporary', nameBn: 'মোকা ও গ্লাস কনটেম্পোরারি', category: 'Luxury', wallColor: '#d6c7b8', accentColor: '#451a03', frameColor: '#1c1917', roofStyle: 'flat', wallPattern: 'plaster', louvers: true, porchColumns: 'square' },
  { id: 'ext-18', name: 'Emerald Roof Pergola', nameBn: 'এমেরাল্ড রুফ পারগোলা', category: 'Eco', wallColor: '#f1f5f9', accentColor: '#047857', frameColor: '#064e3b', roofStyle: 'terrace', wallPattern: 'plaster', louvers: true, porchColumns: 'square' },
  { id: 'ext-19', name: 'Warm Clay Brick Duplex', nameBn: 'পোড়ামাটি ব্রিক ডুপ্লেক্স', category: 'Brick', wallColor: '#b45a42', accentColor: '#78350f', frameColor: '#1c1917', roofStyle: 'gable', wallPattern: 'brick', louvers: false, porchColumns: 'square' },
  { id: 'ext-20', name: 'Pearl White & Bronze', nameBn: 'পার্ল হোয়াইট ও ব্রোঞ্জ', category: 'Luxury', wallColor: '#f8f6f2', accentColor: '#926843', frameColor: '#3f2e25', roofStyle: 'terrace', wallPattern: 'plaster', louvers: true, porchColumns: 'round' },
  { id: 'ext-21', name: 'Graphite Executive Villa', nameBn: 'গ্রাফাইট এক্সিকিউটিভ ভিলা', category: 'Luxury', wallColor: '#64748b', accentColor: '#f59e0b', frameColor: '#0f172a', roofStyle: 'flat', wallPattern: 'plaster', louvers: true, porchColumns: 'square' },
  { id: 'ext-22', name: 'Mint Mist Budget Home', nameBn: 'মিন্ট মিস্ট বাজেট হোম', category: 'Modern', wallColor: '#e2f2ea', accentColor: '#0f766e', frameColor: '#134e4a', roofStyle: 'flat', wallPattern: 'plaster', louvers: false, porchColumns: 'square' },
  { id: 'ext-23', name: 'Heritage Arch Mansion', nameBn: 'হেরিটেজ ক্লাসিক ম্যানশন', category: 'Classic', wallColor: '#efe5d1', accentColor: '#6b3e26', frameColor: '#3b1f10', roofStyle: 'terrace', wallPattern: 'plaster', louvers: false, porchColumns: 'round' },
  { id: 'ext-24', name: 'Chittagong Hill Timber', nameBn: 'হিল-ভিউ টিম্বার মডার্ন', category: 'Eco', wallColor: '#e7dfd3', accentColor: '#7c4d2f', frameColor: '#292524', roofStyle: 'gable', wallPattern: 'plaster', louvers: true, porchColumns: 'square' },
];

export const FLOOR_DESIGNS = [
  { id: 'flr-01', name: 'Warm Ivory Porcelain', nameBn: 'ওয়ার্ম আইভরি টাইলস', pattern: 'grid', base: '#ece7df', accent: '#cbd5e1' },
  { id: 'flr-02', name: 'Italian Carrara Marble', nameBn: 'ইতালিয়ান হোয়াইট মার্বেল', pattern: 'marble', base: '#f8fafc', accent: '#94a3b8' },
  { id: 'flr-03', name: 'Teak Wooden Parquet', nameBn: 'সেগুন উডেন পার্কুয়েট', pattern: 'wood', base: '#925c38', accent: '#5c351d' },
  { id: 'flr-04', name: 'Matte Grey Concrete', nameBn: 'ম্যাট গ্রে কংক্রিট ফ্লোর', pattern: 'grid', base: '#cbd5e1', accent: '#64748b' },
  { id: 'flr-05', name: 'BD Classic Mosaic', nameBn: 'ক্লাসিক মোজাইক ফ্লোর', pattern: 'terrazzo', base: '#e5e7eb', accent: '#475569' },
  { id: 'flr-06', name: 'Royal Cream Mirror Polish', nameBn: 'ক্রিম মিরর পলিশ টাইলস', pattern: 'grid', base: '#f5edd8', accent: '#d6c4a0' },
  { id: 'flr-07', name: 'Checkerboard Noir & Pearl', nameBn: 'ব্ল্যাক-হোয়াইট চেকারবোর্ড', pattern: 'checker', base: '#f1f5f9', accent: '#334155' },
  { id: 'flr-08', name: 'Oak Herringbone Wood', nameBn: 'ওক হেরিংবোন উড', pattern: 'wood', base: '#b07d52', accent: '#754e2e' },
  { id: 'flr-09', name: 'Sandstone Travertine', nameBn: 'স্যান্ডস্টোন ট্র্যাভার্টাইন', pattern: 'marble', base: '#e6d5b8', accent: '#a8906e' },
  { id: 'flr-10', name: 'Dark Walnut Luxury', nameBn: 'ডার্ক ওয়ালনাট উড', pattern: 'wood', base: '#593a28', accent: '#362014' },
  { id: 'flr-11', name: 'Terrazzo Pastel Modern', nameBn: 'টেরাজ্জো মডার্ন ফ্লোর', pattern: 'terrazzo', base: '#f3f0ea', accent: '#d97706' },
  { id: 'flr-12', name: 'Emerald Vein Marble', nameBn: 'এমেরাল্ড ভেইন মার্বেল', pattern: 'marble', base: '#e6f4ee', accent: '#047857' },
  { id: 'flr-13', name: 'Charcoal Slate Stone', nameBn: 'চারকোল স্লেট স্টোন', pattern: 'grid', base: '#475569', accent: '#1e293b' },
  { id: 'flr-14', name: 'Terracotta Clay Tile', nameBn: 'পোড়ামাটি টেরাকোটা টাইলস', pattern: 'grid', base: '#c46d4e', accent: '#8c3f27' },
  { id: 'flr-15', name: 'Pearl Beige Ceramic', nameBn: 'পার্ল বেইজ সিরামিক', pattern: 'grid', base: '#ebe3d5', accent: '#b8aa95' },
  { id: 'flr-16', name: 'Nordic Ash Plank', nameBn: 'নর্ডিক অ্যাশ উডেন', pattern: 'wood', base: '#c8bfb2', accent: '#8c8173' },
  { id: 'flr-17', name: 'Sky Mist Gloss Tile', nameBn: 'স্কাই মিস্ট গ্লস টাইলস', pattern: 'marble', base: '#e0f2fe', accent: '#38bdf8' },
  { id: 'flr-18', name: 'Warm Sand Terrazzo', nameBn: 'স্যান্ড টেরাজ্জো ফিনিশ', pattern: 'terrazzo', base: '#eadcc7', accent: '#78350f' },
  { id: 'flr-19', name: 'Obsidian Gold Marble', nameBn: 'ব্ল্যাক-গোল্ড লাক্সারি মার্বেল', pattern: 'marble', base: '#1e293b', accent: '#fbbf24' },
  { id: 'flr-20', name: 'Olive & Cream Checker', nameBn: 'অলিভ-ক্রিম ডাইনিং চেকার', pattern: 'checker', base: '#f5f2e8', accent: '#4d7c0f' },
  { id: 'flr-21', name: 'Pure White Studio Tile', nameBn: 'পিওর হোয়াইট স্টুডিও টাইলস', pattern: 'grid', base: '#ffffff', accent: '#e2e8f0' },
];
