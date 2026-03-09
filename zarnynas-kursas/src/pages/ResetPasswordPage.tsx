import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/naujas-slaptazodis`
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4">
            <span className="text-2xl text-white font-bold">GK</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GyvenimoKlubas</h1>
          <p className="text-gray-500 mt-1">Mokymų platforma</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {sent ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Laiškas išsiųstas</h2>
              <p className="text-gray-500 text-sm mb-6">
                Patikrinkite savo el. paštą <strong>{email}</strong> ir paspauskite nuorodą slaptažodžiui atstatyti.
              </p>
              <Link
                to="/prisijungti"
                className="inline-block text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                ← Grįžti į prisijungimą
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Slaptažodžio atstatymas</h2>
              <p className="text-gray-500 text-sm mb-6">
                Įveskite savo el. paštą ir atsiųsime nuorodą slaptažodžiui pakeisti.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">El. paštas</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="jusu@el.pastas.lt"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Palaukite...' : 'Siųsti nuorodą'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/prisijungti" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  ← Grįžti į prisijungimą
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 GyvenimoKlubas. Visos teisės saugomos.
        </p>
      </div>
    </div>
  )
}
