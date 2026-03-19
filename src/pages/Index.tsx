import { useState, useEffect } from 'react'
import { confirmRSVP, getContactLink, type RSVPResult } from '../lib/guests'

const INVITE_URL = 'https://elielelarissaconvite.my.canva.site/eliel-larissa-site'

type FeedbackState = {
  type: 'success' | 'error' | 'warning' | null
  message: string
}

export default function Index() {
  const [name, setName] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState>({ type: null, message: '' })
  const [loading, setLoading] = useState(false)
  const [contactLink, setContactLink] = useState('')

  useEffect(() => {
    setContactLink(getContactLink())
  }, [])

  function handleConfirm() {
    if (!name.trim()) {
      setFeedback({ type: 'error', message: 'Por favor, digite seu nome.' })
      return
    }

    setLoading(true)
    setTimeout(() => {
      const result: RSVPResult = confirmRSVP(name)
      if (result === 'confirmed') {
        setFeedback({
          type: 'success',
          message: `Presença confirmada com sucesso! Que alegria ter você conosco, ${name.trim()}!`,
        })
        setName('')
      } else if (result === 'already_confirmed') {
        setFeedback({
          type: 'warning',
          message: `${name.trim()}, você já confirmou sua presença anteriormente. Até logo!`,
        })
      } else {
        setFeedback({
          type: 'error',
          message: 'Nome não encontrado na lista de convidados. Verifique seu nome ou entre em contato com os noivos.',
        })
      }
      setLoading(false)
    }, 600)
  }

  const feedbackClasses: Record<string, string> = {
    success: 'bg-green-50 border border-green-300 text-green-800',
    error: 'bg-red-50 border border-red-300 text-red-800',
    warning: 'bg-yellow-50 border border-yellow-300 text-yellow-800',
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        <div className="relative h-[480px] sm:h-[560px]">
          <img
            src="/couple.png"
            alt="Eliel e Larissa"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-cream" />
        </div>

        <div className="relative -mt-32 pb-8 text-center px-4 fade-in-up">
          <img
            src="/monogram.png"
            alt="EL"
            className="w-24 h-24 mx-auto mb-2 drop-shadow-md"
          />
          <h1 className="font-script text-7xl sm:text-8xl text-olive-800 leading-none drop-shadow-sm">
            Eliel
          </h1>
          <p className="font-script text-5xl sm:text-6xl text-olive-600 -mt-2">&amp;</p>
          <h1 className="font-script text-7xl sm:text-8xl text-olive-800 leading-none -mt-2 drop-shadow-sm">
            Larissa
          </h1>
        </div>
      </section>

      {/* Tagline */}
      <section className="text-center px-6 py-4 fade-in-up delay-200">
        <p className="font-serif italic text-stone-600 text-base sm:text-lg leading-relaxed max-w-sm mx-auto">
          Com a bênção de Deus e de nossos pais,<br />
          convidamos você para a celebração<br />
          do nosso casamento.
        </p>

        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="h-px w-12 bg-olive-300" />
          <div className="flex items-baseline gap-2 sm:gap-3">
            <span className="font-serif text-stone-500 text-sm sm:text-base tracking-widest uppercase">Maio</span>
            <span className="font-serif font-bold text-olive-700 text-4xl sm:text-5xl">30</span>
            <span className="font-serif text-stone-500 text-sm sm:text-base tracking-widest">2026</span>
          </div>
          <div className="h-px w-12 bg-olive-300" />
        </div>
      </section>

      {/* Ornament */}
      <div className="text-center text-olive-300 text-2xl py-2 select-none">❧</div>

      {/* RSVP Section */}
      <section className="flex-1 px-4 pb-10">
        <div className="max-w-md mx-auto">
          <div className="card fade-in-up delay-300">
            <h2 className="font-serif font-semibold text-olive-800 text-xl sm:text-2xl text-center mb-1">
              Confirme sua Presença
            </h2>
            <p className="text-stone-500 text-sm text-center mb-6">
              Digite seu nome exatamente como foi convidado
            </p>

            <input
              type="text"
              className="input-field mb-4"
              placeholder="Seu nome completo"
              value={name}
              onChange={e => { setFeedback({ type: null, message: '' }); setName(e.target.value) }}
              onKeyDown={e => e.key === 'Enter' && handleConfirm()}
              disabled={loading}
            />

            {feedback.type && (
              <div className={`rounded-xl px-4 py-3 text-sm mb-4 text-center fade-in ${feedbackClasses[feedback.type]}`}>
                {feedback.message}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Confirmar Presença'}
            </button>
          </div>

          {/* Quick links */}
          <div className={`grid gap-3 mt-6 fade-in-up delay-400 ${contactLink ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="card flex flex-col items-center gap-2 text-center hover:shadow-xl transition-shadow duration-200 no-underline py-5"
            >
              <span className="text-3xl">💌</span>
              <span className="font-serif text-olive-800 text-sm font-semibold">Voltar ao Convite</span>
              <span className="text-xs text-stone-400">Ver convite online</span>
            </a>

            {contactLink && (
              <a
                href={contactLink}
                target="_blank"
                rel="noopener noreferrer"
                className="card flex flex-col items-center gap-2 text-center hover:shadow-xl transition-shadow duration-200 no-underline py-5"
              >
                <span className="text-3xl">📞</span>
                <span className="font-serif text-olive-800 text-sm font-semibold">Fale Conosco</span>
                <span className="text-xs text-stone-400">Entrar em contato</span>
              </a>
            )}
          </div>

          <p className="text-center text-stone-300 text-xs mt-8">
            <a href="/admin" className="hover:text-olive-400 transition-colors">admin</a>
          </p>
        </div>
      </section>
    </div>
  )
}
