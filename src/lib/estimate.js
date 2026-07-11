// ---------------------------------------------------------------------------
// Deterministic estimate engine.
// Design principle from the PRD: the math is deterministic; the AI explains.
// The LLM never computes or adjusts these numbers.
// ---------------------------------------------------------------------------

function costForCode(rate, elig) {
  // Copay plan: office visit copay applies regardless of deductible.
  if (elig.specialistCopay != null) {
    return { patientCost: elig.specialistCopay, mechanics: 'copay' }
  }

  const remainingDeductible = Math.max(
    0,
    (elig.deductibleTotal ?? 0) - (elig.deductibleMet ?? 0)
  )

  if (remainingDeductible >= rate) {
    // Entire negotiated rate goes to the deductible.
    return { patientCost: rate, mechanics: 'deductible' }
  }

  // Split: remainder of deductible, then coinsurance on the rest.
  const deductiblePortion = remainingDeductible
  const coinsurancePortion = (rate - remainingDeductible) * (elig.coinsurance ?? 0)
  return {
    patientCost: deductiblePortion + coinsurancePortion,
    mechanics: deductiblePortion > 0 ? 'split' : 'coinsurance',
  }
}

export function computeEstimate(provider, persona, visitReason) {
  const elig = persona.eligibility

  // Graceful degradation: no rate data means no estimate. A wrong estimate
  // is worse than no estimate.
  if (!provider.rates) {
    return { available: false, reason: 'no_rate_data' }
  }

  const lines = visitReason.candidateCodes.map((c) => {
    const rate = provider.rates[c.code]
    const { patientCost, mechanics } = costForCode(rate, elig)
    return { ...c, rate, patientCost: Math.round(patientCost), mechanics }
  })

  const costs = lines.map((l) => l.patientCost)
  const low = Math.min(...costs)
  const high = Math.max(...costs)

  // Confidence tiering per PRD section 8:
  // High   = eligibility complete + rate data fresh (<30 days)
  // Medium = accumulators missing OR rate data stale
  let confidence = 'High'
  const reasons = []
  if (!elig.accumulatorsReturned) {
    confidence = 'Medium'
    reasons.push('Your insurer did not return deductible details, so this estimate leans on your plan\u2019s copay structure.')
  }
  if (provider.rateDataFreshDays != null && provider.rateDataFreshDays > 30) {
    confidence = 'Medium'
    reasons.push(`Published rate data for this provider is ${provider.rateDataFreshDays} days old.`)
  }
  if (confidence === 'High') {
    reasons.push('Your insurer returned complete benefit details and this provider\u2019s rate data is current.')
  }

  return {
    available: true,
    low,
    high,
    lines,
    confidence,
    confidenceReasons: reasons,
    mechanics: lines[0].mechanics,
  }
}

export const fmt = (n) => `$${Math.round(n).toLocaleString()}`
