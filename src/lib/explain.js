// ---------------------------------------------------------------------------
// AI explanation layer.
// Receives ONLY structured, de-identified estimate inputs (mirroring the
// production PHI boundary in PRD section 10) and returns plain language.
// Calls /api/explain (Anthropic API via serverless function) when deployed
// with an ANTHROPIC_API_KEY; otherwise falls back to deterministic template
// copy so the clickable flow always works.
// ---------------------------------------------------------------------------

export function buildStructuredInputs(estimate, persona, provider, visitReason) {
  const e = persona.eligibility
  return {
    visitType: visitReason.label,
    specialty: visitReason.specialty,
    estimateLow: estimate.low,
    estimateHigh: estimate.high,
    confidence: estimate.confidence,
    planType: persona.planType,
    deductibleTotal: e.deductibleTotal,
    deductibleMet: e.deductibleMet,
    coinsurancePct: e.coinsurance != null ? e.coinsurance * 100 : null,
    specialistCopay: e.specialistCopay,
    candidateCodes: estimate.lines.map((l) => ({
      code: l.code,
      negotiatedRate: l.rate,
      patientCost: l.patientCost,
    })),
  }
}

export async function fetchExplanation(inputs) {
  try {
    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs),
    })
    if (!res.ok) throw new Error(`api ${res.status}`)
    const data = await res.json()
    if (data.explanation) return { text: data.explanation, source: 'llm' }
    throw new Error('empty')
  } catch {
    return { text: fallbackExplanation(inputs), source: 'fallback' }
  }
}

export function fallbackExplanation(i) {
  if (i.specialistCopay != null) {
    return (
      `Your plan charges a flat $${i.specialistCopay} copay for specialist office visits, ` +
      `so you pay the same amount whether this is billed as a shorter or longer appointment. ` +
      `Your insurer did not share your deductible progress, but for a standard office visit ` +
      `like this one, the copay is what applies.`
    )
  }
  const remaining = i.deductibleTotal - i.deductibleMet
  if (remaining > 0 && i.estimateHigh <= remaining + 1) {
    return (
      `You have $${remaining.toLocaleString()} left on your $${i.deductibleTotal.toLocaleString()} deductible, ` +
      `so you pay the full negotiated rate for this visit. The range covers whether the visit is billed ` +
      `as a standard or a longer new-patient appointment. Every dollar counts toward your deductible.`
    )
  }
  return (
    `Your deductible is met for the year, so you pay ${i.coinsurancePct}% coinsurance on the ` +
    `negotiated rate instead of the full price. The range reflects whether the visit is billed as a ` +
    `standard or a longer new-patient appointment.`
  )
}
