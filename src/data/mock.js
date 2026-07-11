// ---------------------------------------------------------------------------
// MOCK BOUNDARY
// Everything in this file simulates external data systems that a production
// Cost Checker would integrate with:
//   1. Transparency in Coverage machine-readable files (payer negotiated rates)
//   2. Real-time 270/271 eligibility responses via a clearinghouse
//   3. A visit-reason -> billing-code mapping table
// The estimate math in src/lib/estimate.js runs deterministically on these
// inputs, exactly as it would on real ones.
// ---------------------------------------------------------------------------

export const VISIT_REASON = {
  id: 'derm-new-patient',
  label: 'New patient skin exam',
  specialty: 'Dermatology',
  // Visit-reason mapper output: candidate E/M codes with probability weights,
  // seeded (in production) from public utilization data.
  candidateCodes: [
    { code: '99203', description: 'Office visit, new patient, low complexity', weight: 0.55 },
    { code: '99204', description: 'Office visit, new patient, moderate complexity', weight: 0.45 },
  ],
}

// Synthetic Transparency in Coverage (MRF) snippets: negotiated rates per
// provider NPI per billing code, per payer.
export const PROVIDERS = [
  {
    id: 'p1',
    npi: '1932000001',
    name: 'Dr. Maya Okafor, MD',
    specialty: 'Dermatology',
    clinic: 'Lakeview Dermatology Group',
    distance: '1.2 mi',
    rating: 4.9,
    reviews: 312,
    nextAvailable: 'Tomorrow, 9:40 AM',
    inNetwork: true,
    rates: { '99203': 148, '99204': 214 },
    rateDataFreshDays: 18,
  },
  {
    id: 'p2',
    npi: '1932000002',
    name: 'Dr. Samuel Reyes, DO',
    specialty: 'Dermatology',
    clinic: 'North Branch Skin & Surgery',
    distance: '2.8 mi',
    rating: 4.7,
    reviews: 188,
    nextAvailable: 'Mon, 2:15 PM',
    inNetwork: true,
    rates: { '99203': 172, '99204': 251 },
    rateDataFreshDays: 47,
  },
  {
    id: 'p3',
    npi: '1932000003',
    name: 'Dr. Anne Whitfield, MD',
    specialty: 'Dermatology',
    clinic: 'Whitfield Dermatology',
    distance: '3.5 mi',
    rating: 4.8,
    reviews: 96,
    nextAvailable: 'Wed, 11:00 AM',
    inNetwork: true,
    rates: null, // No rate data published for this NPI: graceful degradation case
    rateDataFreshDays: null,
  },
]

// Mocked 270/271 eligibility responses for three plan personas.
// `accumulatorsReturned: false` simulates payers that omit deductible
// accumulator detail, which downgrades estimate confidence.
export const PERSONAS = [
  {
    id: 'hdhp',
    shortLabel: 'HDHP, deductible not met',
    member: 'Jordan A.',
    payer: 'BlueCross IL',
    plan: 'HDHP Bronze 6000',
    planType: 'hdhp',
    eligibility: {
      active: true,
      accumulatorsReturned: true,
      deductibleTotal: 6000,
      deductibleMet: 850,
      coinsurance: 0.2, // applies after deductible
      specialistCopay: null, // no copay; all costs go to deductible pre-satisfaction
      oopMax: 8000,
      oopMet: 850,
    },
  },
  {
    id: 'ded-met',
    shortLabel: 'PPO, deductible met',
    member: 'Priya S.',
    payer: 'UnitedHealthcare',
    plan: 'Choice Plus PPO',
    planType: 'ppo',
    eligibility: {
      active: true,
      accumulatorsReturned: true,
      deductibleTotal: 1500,
      deductibleMet: 1500,
      coinsurance: 0.15,
      specialistCopay: null, // coinsurance plan
      oopMax: 5000,
      oopMet: 2100,
    },
  },
  {
    id: 'copay',
    shortLabel: 'HMO, specialist copay',
    member: 'Marcus T.',
    payer: 'Aetna',
    plan: 'Whole Health HMO',
    planType: 'hmo',
    eligibility: {
      active: true,
      accumulatorsReturned: false, // payer omits accumulators: confidence downgrade
      deductibleTotal: 500,
      deductibleMet: null,
      coinsurance: null,
      specialistCopay: 50, // copay applies to office visits regardless of deductible
      oopMax: 4500,
      oopMet: null,
    },
  },
]
