import CostChecker from './CostChecker.jsx'
import { computeEstimate, fmt } from '../lib/estimate.js'

export default function BookingReview({ provider, persona, visitReason, onBack, onConfirm }) {
  return (
    <div className="card">
      <button className="linkish" onClick={onBack}>‹ Back to provider</button>
      <div className="eyebrow" style={{ marginTop: 12 }}>Review and confirm</div>
      <h2>{visitReason.label}</h2>

      <div style={{ margin: '12px 0' }}>
        <div className="kv"><span className="k">Provider</span><span className="v">{provider.name}</span></div>
        <div className="kv"><span className="k">When</span><span className="v">{provider.nextAvailable}</span></div>
        <div className="kv"><span className="k">Where</span><span className="v">{provider.clinic}</span></div>
        <div className="kv"><span className="k">Insurance</span><span className="v">{persona.payer} · {persona.plan}</span></div>
      </div>

      <CostChecker provider={provider} persona={persona} visitReason={visitReason} />

      <div className="btn-row">
        <button className="btn primary" onClick={onConfirm}>Confirm booking</button>
        <button className="btn ghost" onClick={onBack}>Go back</button>
      </div>
    </div>
  )
}
