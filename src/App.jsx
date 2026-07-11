import { useState } from 'react'
import { PERSONAS, PROVIDERS, VISIT_REASON } from './data/mock.js'
import SearchResults from './components/SearchResults.jsx'
import ProviderProfile from './components/ProviderProfile.jsx'
import BookingReview from './components/BookingReview.jsx'
import Confirmation from './components/Confirmation.jsx'

const STEPS = ['Search', 'Provider', 'Review', 'Booked']

export default function App() {
  const [personaId, setPersonaId] = useState(PERSONAS[0].id)
  const [step, setStep] = useState(0)
  const [providerId, setProviderId] = useState(null)

  const persona = PERSONAS.find((p) => p.id === personaId)
  const provider = PROVIDERS.find((p) => p.id === providerId)

  const selectProvider = (id) => { setProviderId(id); setStep(1) }
  const switchPersona = (id) => { setPersonaId(id); setStep(0); setProviderId(null) }

  return (
    <div className="app">
      <div className="proto-bar">
        <span className="tag">Concept prototype · demo persona</span>
        <div className="persona-chips" role="tablist" aria-label="Demo insurance persona">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={p.id === personaId}
              className={p.id === personaId ? 'active' : ''}
              onClick={() => switchPersona(p.id)}
            >
              {p.shortLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="crumbs" aria-label="Flow progress">
        {STEPS.map((s, i) => (
          <span key={s} className={i === step ? 'here' : ''}>
            {s}{i < STEPS.length - 1 ? ' ›' : ''}
          </span>
        ))}
      </div>

      {step === 0 && (
        <SearchResults
          providers={PROVIDERS}
          persona={persona}
          visitReason={VISIT_REASON}
          onSelect={selectProvider}
        />
      )}
      {step === 1 && provider && (
        <ProviderProfile
          provider={provider}
          persona={persona}
          visitReason={VISIT_REASON}
          onBack={() => setStep(0)}
          onBook={() => setStep(2)}
        />
      )}
      {step === 2 && provider && (
        <BookingReview
          provider={provider}
          persona={persona}
          visitReason={VISIT_REASON}
          onBack={() => setStep(1)}
          onConfirm={() => setStep(3)}
        />
      )}
      {step === 3 && provider && (
        <Confirmation
          provider={provider}
          persona={persona}
          visitReason={VISIT_REASON}
          onRestart={() => { setStep(0); setProviderId(null) }}
        />
      )}

      <p className="footnote">
        Cost Checker concept prototype by Ash Lingam · Not affiliated with Zocdoc ·
        All providers, plans, and rates are synthetic
      </p>
    </div>
  )
}
