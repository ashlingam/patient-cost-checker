import { computeEstimate, fmt } from '../lib/estimate.js'

export default function Confirmation({ provider, persona, visitReason, onRestart }) {
  const est = computeEstimate(provider, persona, visitReason)

  return (
    <div className="card">
      <div className="confirm-hero">
        <div className="checkmark">✓</div>
        <h2>You're booked</h2>
        <p className="sub">A confirmation is on its way to your email.</p>
      </div>

      <div style={{ margin: '14px 0' }}>
        <div className="kv"><span className="k">Provider</span><span className="v">{provider.name}</span></div>
        <div className="kv"><span className="k">Visit</span><span className="v">{visitReason.label}</span></div>
        <div className="kv"><span className="k">When</span><span className="v">{provider.nextAvailable}</span></div>
        {est.available && (
          <div className="kv">
            <span className="k">Your saved cost estimate</span>
            <span className="v money">
              {est.low === est.high ? fmt(est.low) : `${fmt(est.low)}–${fmt(est.high)}`} · {est.confidence} confidence
            </span>
          </div>
        )}
      </div>

      {est.available && (
        <p className="sub">
          We saved this estimate to your booking. After your visit, we'll ask what you
          were actually billed, so estimates keep getting more accurate for everyone.
        </p>
      )}

      <div className="btn-row">
        <button className="btn ghost" onClick={onRestart}>Start over</button>
      </div>
    </div>
  )
}
