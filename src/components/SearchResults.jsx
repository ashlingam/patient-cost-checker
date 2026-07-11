import { computeEstimate, fmt } from '../lib/estimate.js'

const initials = (name) =>
  name.replace('Dr. ', '').split(' ').slice(0, 2).map((w) => w[0]).join('')

export default function SearchResults({ providers, persona, visitReason, onSelect }) {
  return (
    <>
      <div className="card">
        <div className="eyebrow">Searching</div>
        <h2>{visitReason.label}</h2>
        <p className="sub">
          {visitReason.specialty} · Chicago, IL · Insurance: {persona.payer} {persona.plan}
        </p>
      </div>

      {providers.map((p) => {
        const est = computeEstimate(p, persona, visitReason)
        return (
          <div
            key={p.id}
            className="card provider-row"
            onClick={() => onSelect(p.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(p.id)}
          >
            <div className="avatar">{initials(p.name)}</div>
            <div className="provider-meta">
              <h3>{p.name}</h3>
              <div className="sub">
                {p.clinic} · {p.distance} · ★ {p.rating} ({p.reviews})
              </div>
              <div className="badges">
                {p.inNetwork && <span className="badge network">✓ In network</span>}
                {est.available ? (
                  <span className="badge cost">
                    Est. cost for you: <strong className="money">{fmt(est.low)}–{fmt(est.high)}</strong>
                  </span>
                ) : (
                  <span className="badge">Cost estimate unavailable</span>
                )}
              </div>
            </div>
            <div className="row-right">
              <span className="slot">{p.nextAvailable}</span>
            </div>
          </div>
        )
      })}
    </>
  )
}
