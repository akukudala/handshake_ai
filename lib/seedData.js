// Mock prospect data for Handshake AI.
// This seeds data/db.json on first run. Edit freely for your demo.

const prospects = [
  {
    prospect_id: "p-001",
    business_name: "Bluebird Coffee Roasters",
    owner_name: "Maria Delgado",
    industry: "Food & Beverage",
    address: "412 Market St, San Francisco, CA",
    distance_miles: 0.8,
    phone_number: "+1 (415) 555-0142",
    match_score: 92,
    current_provider: "Square",
    estimated_revenue: "$640K/yr",
    business_description:
      "Specialty coffee roaster and cafe with two locations and a growing wholesale program.",
    likely_pain_points: [
      "High per-transaction fees on Square",
      "Slow wholesale invoicing",
      "No integrated loyalty program",
    ],
    status: "New",
  },
  {
    prospect_id: "p-002",
    business_name: "Ironclad Auto Repair",
    owner_name: "Derek Nolan",
    industry: "Automotive",
    address: "88 Industrial Way, Oakland, CA",
    distance_miles: 3.4,
    phone_number: "+1 (510) 555-0177",
    match_score: 81,
    current_provider: "Cash + manual invoices",
    estimated_revenue: "$1.2M/yr",
    business_description:
      "Independent auto repair shop specializing in European vehicles and fleet maintenance contracts.",
    likely_pain_points: [
      "Manual paper invoicing causing payment delays",
      "No way to take deposits on big repairs",
      "Chasing fleet customers for net-30 payments",
    ],
    status: "Called",
  },
  {
    prospect_id: "p-003",
    business_name: "Lotus Wellness Studio",
    owner_name: "Priya Raman",
    industry: "Health & Wellness",
    address: "1500 Valencia St, San Francisco, CA",
    distance_miles: 1.9,
    phone_number: "+1 (415) 555-0188",
    match_score: 88,
    current_provider: "Mindbody",
    estimated_revenue: "$520K/yr",
    business_description:
      "Boutique yoga and wellness studio offering memberships, class packs, and retail products.",
    likely_pain_points: [
      "Recurring membership billing failures",
      "Mindbody fees eating into margins",
      "Disconnected retail and class checkout",
    ],
    status: "Appointment Set",
  },
  {
    prospect_id: "p-004",
    business_name: "Granite Peak Outfitters",
    owner_name: "Sam Whitaker",
    industry: "Retail",
    address: "77 Shoreline Hwy, Mill Valley, CA",
    distance_miles: 9.1,
    phone_number: "+1 (415) 555-0199",
    match_score: 74,
    current_provider: "Shopify POS",
    estimated_revenue: "$980K/yr",
    business_description:
      "Outdoor gear retailer with a physical storefront, rental program, and seasonal online sales.",
    likely_pain_points: [
      "Reconciling online and in-store inventory",
      "Rental deposits handled off-system",
      "Seasonal cash-flow gaps",
    ],
    status: "New",
  },
  {
    prospect_id: "p-005",
    business_name: "Casa Verde Landscaping",
    owner_name: "Hector Morales",
    industry: "Home Services",
    address: "240 Elm Ave, Berkeley, CA",
    distance_miles: 5.6,
    phone_number: "+1 (510) 555-0123",
    match_score: 69,
    current_provider: "Checks + QuickBooks",
    estimated_revenue: "$430K/yr",
    business_description:
      "Residential and commercial landscaping company with recurring maintenance contracts.",
    likely_pain_points: [
      "Late payments on recurring contracts",
      "No card-on-file for repeat customers",
      "Manual reconciliation with QuickBooks",
    ],
    status: "New",
  },
  {
    prospect_id: "p-006",
    business_name: "Pixel & Pour Print Shop",
    owner_name: "Janelle Park",
    industry: "Professional Services",
    address: "350 9th St, San Francisco, CA",
    distance_miles: 1.2,
    phone_number: "+1 (415) 555-0166",
    match_score: 85,
    current_provider: "PayPal Invoicing",
    estimated_revenue: "$310K/yr",
    business_description:
      "Custom printing and design shop serving small businesses, events, and local creators.",
    likely_pain_points: [
      "PayPal hold delays on large orders",
      "No deposit workflow for custom jobs",
      "Hard to track repeat B2B clients",
    ],
    status: "Not Interested",
  },
  {
    prospect_id: "p-007",
    business_name: "Harborview Dental",
    owner_name: "Dr. Allison Chen",
    industry: "Healthcare",
    address: "920 Embarcadero, San Francisco, CA",
    distance_miles: 2.3,
    phone_number: "+1 (415) 555-0150",
    match_score: 90,
    current_provider: "Legacy terminal (First Data)",
    estimated_revenue: "$1.8M/yr",
    business_description:
      "Modern dental practice offering general and cosmetic dentistry with flexible patient financing.",
    likely_pain_points: [
      "Outdated terminal, no contactless",
      "Patient financing handled by third party",
      "No automated payment reminders",
    ],
    status: "Called",
  },
  {
    prospect_id: "p-008",
    business_name: "The Daily Knead Bakery",
    owner_name: "Tomás Rivera",
    industry: "Food & Beverage",
    address: "55 Cortland Ave, San Francisco, CA",
    distance_miles: 4.0,
    phone_number: "+1 (415) 555-0133",
    match_score: 78,
    current_provider: "Clover",
    estimated_revenue: "$520K/yr",
    business_description:
      "Neighborhood artisan bakery with a wholesale line supplying local cafes and restaurants.",
    likely_pain_points: [
      "Wholesale invoicing is fully manual",
      "Clover hardware costs are high",
      "No online pre-order payments",
    ],
    status: "New",
  },
];

// A single demo rep.
const rep = {
  rep_id: "rep-001",
  name: "Alex Carter",
  email: "alex@handshake.ai",
  territory: "San Francisco Bay Area",
};

module.exports = { prospects, rep };
