import CostChecker from './CostChecker.jsx'

export default function ProviderProfile({ provider, persona, visitReason, onBack, onBook }) {
  return (
    <>
      <div className="card">
        <button className="linkish" onClick={onBack}>‹ Back to results</button>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 12 }}>
          <div className="avatar">
            {provider.name.replace('Dr. ', '').split(' ').slice(0, 2).map((w) => w[0]).join('')}
          </div>
          <div>
            <h2>{provider.name}</h2>
            <div className="sub">
              {provider.specialty} · {provider.clinic} · ★ {provider.rating} ({provider.reviews} verified reviews)
            </div>
          </div>
        </div>

        <div className="badges" style={{ marginTop: 12 }}>
          <span className="badge network">✓ In network: {persona.payer} {persona.plan}</span>
          <span className="badge">{visitReason.label}</span>
          <span className="badge">{provider.nextAvailable}</span>
        </div>

        <CostChecker provider={provider} persona={persona} visitReason={visitReason} />

        <div className="btn-row">
          <button className="btn primary" onClick={onBook}>
            Book {provider.nextAvailable}
          </button>
        </div>
      </div>
    </>
  )
}
