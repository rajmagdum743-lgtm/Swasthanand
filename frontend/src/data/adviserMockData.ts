export interface AdviserProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  matchScore: number; // Percentage e.g. 98
  badge: string;
  expertBenefit: string;
  whyRecommended: string;
  usageInstructions: string;
  recoveryTimeline: string;
  dosageCycle: string;
  tags: string[];
}

export interface AssessmentData {
  goalText?: string;
  primaryConcern?: string;
  duration?: string;
  lifestyleFactors?: string[];
  age?: number | '';
  weight?: number | '';
  allergies?: string[];
  conditions?: string[];
}

export const CATALOG_RECOMMENDATIONS: AdviserProduct[] = [
  {
    id: 'prod-turmeric-01',
    name: 'Organic Turmeric Finger (Haridra)',
    price: 299,
    image: '/images/products/organic-turmeric-finger.jpg',
    category: 'Spices & Herbal Solutions',
    description: 'Handpicked organic turmeric fingers rich in natural curcumin (5.2%). Sourced from certified Agro-Cooperatives in Sangli.',
    matchScore: 98,
    badge: 'Top Match for Inflammation & Immunity',
    expertBenefit: 'Reduces systemic inflammation, supports joint mobility, and clears micro-channels.',
    whyRecommended: 'Selected because your wellness profile indicated joint stiffness or immunity needs. Natural curcumin acts as a potent antioxidant while balancing internal Agni.',
    usageInstructions: 'Take 1/2 tsp with warm milk or honey after meals.',
    recoveryTimeline: '2 to 3 weeks of daily regimen',
    dosageCycle: 'Daily (Morning & Evening)',
    tags: ['acidity', 'joint-pain', 'immunity', 'skin', 'inflammation', 'fatigue']
  },
  {
    id: 'prod-ghee-01',
    name: 'Pure A2 Vedic Ghee (Bilona Churned)',
    price: 850,
    image: '/images/products/pure-a2-vedic-ghee.jpg',
    category: 'Vedic Dairy',
    description: 'Traditional Bilona method hand-churned A2 ghee prepared from free-range Gir desi cow milk in Satara.',
    matchScore: 95,
    badge: 'Best for Gut & Vitality (Ojas)',
    expertBenefit: 'Soothes gastric lining, enhances nutrient bioavailability, and restores tissue lubrication.',
    whyRecommended: 'Recommended based on your digestive or energy requirements. Vedic A2 Ghee neutralizes excess Pitta acidity and pacifies Vata dryness in the gastrointestinal tract.',
    usageInstructions: '1 tsp melted in warm water morning on empty stomach, or with meals.',
    recoveryTimeline: 'Immediate digestive soothing, 4 weeks for deep tissue vitality',
    dosageCycle: 'Daily morning ritual',
    tags: ['acidity', 'digestion', 'energy', 'sleep', 'weight-loss', 'gastric']
  },
  {
    id: 'prod-moringa-01',
    name: 'Moringa Leaf Powder (Shigru)',
    price: 199,
    image: '/images/products/moringa-powder-(shigru).jpg',
    category: 'Nutritional Supplements',
    description: 'Shade-dried nutrient-dense organic drumstick leaf powder packed with bio-available iron, calcium, and antioxidants.',
    matchScore: 92,
    badge: 'Cellular Energy Boost',
    expertBenefit: 'Combats metabolic lethargy, purifies blood, and boosts endurance without synthetic stimulants.',
    whyRecommended: 'Matches your low energy or general vitality goal. Moringa (Shigru) is revered in Ayurvedic texts for providing Prana (life-force energy) to fatigued tissues.',
    usageInstructions: 'Mix 1 tsp with warm water or herbal tea once daily after breakfast.',
    recoveryTimeline: '7 to 10 days for visible energy revival',
    dosageCycle: 'Daily morning',
    tags: ['energy', 'fatigue', 'immunity', 'weight-loss', 'vitality']
  },
  {
    id: 'prod-triphala-01',
    name: 'Organic Triphala Churna',
    price: 249,
    image: '/images/products/moringa-powder-(shigru).jpg',
    category: 'Herbal Formulations',
    description: 'Balanced blend of Amla, Haritaki, and Bibhitaki for complete gut cleansing and gentle overnight rejuvenation.',
    matchScore: 96,
    badge: 'Digestive Harmony & Detox',
    expertBenefit: 'Regulates bowel motility, relieves bloating, and gently purges metabolic toxins (Ama).',
    whyRecommended: 'Ideal for your digestive discomfort or detoxification request. Triphala harmonizes all three Doshas (Vata, Pitta, Kapha) for smooth GI elimination.',
    usageInstructions: '1 tsp with warm water before sleeping.',
    recoveryTimeline: 'Overnight relief, 14 days for optimal bowel rhythm',
    dosageCycle: 'Nightly before sleep',
    tags: ['digestion', 'acidity', 'weight-loss', 'detox', 'bloating']
  },
  {
    id: 'prod-mustard-01',
    name: 'Cold Pressed Mustard Oil (Kachi Ghani)',
    price: 349,
    image: '/images/products/cold-pressed-mustard-oil.jpg',
    category: 'Pure Oils & Abhyanga',
    description: 'Traditional kachi ghani cold pressed pure organic mustard oil from unrefined seeds in Solapur.',
    matchScore: 89,
    badge: 'Vata Relief & Warmth',
    expertBenefit: 'Promotes blood circulation, warms cold joints, and stimulates sluggish digestive Agni.',
    whyRecommended: 'Chosen for joint wellness or external application. Mustard oil helps unblock Vata stagnation and provides cellular warmth.',
    usageInstructions: 'Use for culinary seasoning or warm joint massaged before bath.',
    recoveryTimeline: '3 to 5 weeks of regular massage or diet integration',
    dosageCycle: 'Daily topical / culinary',
    tags: ['joint-pain', 'circulation', 'vata', 'cold']
  }
];

export const EXAMPLE_PROMPTS = [
  "I often experience acidity",
  "I want better sleep",
  "I have digestive discomfort",
  "I want support for joint wellness"
];

/**
 * Intelligent Client-Side Recommendation Matching Simulation
 */
export function getSimulatedRecommendations(data: AssessmentData): AdviserProduct[] {
  const textQuery = (data.goalText || '').toLowerCase();
  const concernQuery = (data.primaryConcern || '').toLowerCase();
  const combinedText = `${textQuery} ${concernQuery}`;

  // Filter based on matching tags or return curated top products
  let matched = CATALOG_RECOMMENDATIONS.filter(prod => {
    return prod.tags.some(tag => combinedText.includes(tag)) ||
      (data.allergies && !data.allergies.some(allergy => prod.description.toLowerCase().includes(allergy.toLowerCase())));
  });

  if (matched.length === 0) {
    // If no direct tag keyword matched, pick top 3 curated catalog products
    matched = CATALOG_RECOMMENDATIONS.slice(0, 3);
  }

  // Ensure maximum 4 products returned for clean layout
  return matched.slice(0, 4);
}
