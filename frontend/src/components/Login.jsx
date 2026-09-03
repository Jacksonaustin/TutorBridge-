import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const MAJORS = [
  'Computer Science',
  'Information Technology',
  'Cybersecurity',
  'Mathematics',
  'Engineering',
  'Biology',
  'Psychology',
  'Nursing',
  'Business',
  'Education',
  'Criminal Justice',
  'Other',
]

export function LoginCard({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [major, setMajor] = useState('')
  const [otherMajor, setOtherMajor] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isSignup = mode === 'signup'

  function switchMode() {
    setMode(isSignup ? 'login' : 'signup')
    setError('')
    setPassword('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const selectedMajor = major === 'Other' ? otherMajor.trim() : major

    const body = isSignup
      ? { name, email, password, major: selectedMajor }
      : { email, password }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/${isSignup ? 'signup' : 'login'}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(body),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        if (Array.isArray(data.errors)) {
          setError(data.errors.join(' '))
        } else {
          setError(data.message || 'Unable to complete request.')
        }
        return
      }

      onAuthenticated(data.user)
    } catch {
      setError('Unable to reach the server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg bg-TutorBridge-dark p-8 shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-TutorBridge-text">
          {isSignup ? 'Create Account' : 'Login'}
        </h2>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <div className="mb-4">
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-TutorBridge-text">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="w-full rounded-md bg-TutorBridge-input px-3 py-2 text-TutorBridge-text focus:border-TutorBridge-accent focus:outline-none focus:ring"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="major" className="mb-1 block text-sm font-medium text-TutorBridge-text">
                  Major <span className="font-normal text-TutorBridge-muted">(optional)</span>
                </label>
                <select
                  id="major"
                  name="major"
                  value={major}
                  onChange={(event) => {
                    setMajor(event.target.value)
                    if (event.target.value !== 'Other') {
                      setOtherMajor('')
                    }
                  }}
                  className="w-full rounded-md bg-TutorBridge-input px-3 py-2 text-TutorBridge-text focus:border-TutorBridge-accent focus:outline-none focus:ring"
                >
                  <option value="">Select a major</option>
                  {MAJORS.map((majorName) => (
                    <option key={majorName} value={majorName}>
                      {majorName}
                    </option>
                  ))}
                </select>
              </div>

              {major === 'Other' && (
                <div className="mb-4">
                  <label htmlFor="otherMajor" className="mb-1 block text-sm font-medium text-TutorBridge-text">
                    Enter your major
                  </label>
                  <input
                    type="text"
                    id="otherMajor"
                    name="otherMajor"
                    value={otherMajor}
                    onChange={(event) => setOtherMajor(event.target.value)}
                    placeholder="Example: Graphic Design"
                    className="w-full rounded-md bg-TutorBridge-input px-3 py-2 text-TutorBridge-text placeholder:text-TutorBridge-muted focus:border-TutorBridge-accent focus:outline-none focus:ring"
                  />
                </div>
              )}
            </>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-TutorBridge-text">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-md bg-TutorBridge-input px-3 py-2 text-TutorBridge-text focus:border-TutorBridge-accent focus:outline-none focus:ring"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-TutorBridge-text">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={isSignup ? 8 : undefined}
              required
              className="w-full rounded-md bg-TutorBridge-input px-3 py-2 text-TutorBridge-text focus:border-TutorBridge-accent focus:outline-none focus:ring"
            />
            {isSignup && (
              <p className="mt-1 text-xs text-TutorBridge-muted">At least 8 characters.</p>
            )}
          </div>

          {error && (
            <p className="mb-4 rounded-md bg-TutorBridge-input px-3 py-2 text-sm text-TutorBridge-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-TutorBridge-accent px-4 py-2 text-TutorBridge-text transition-colors hover:bg-TutorBridge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Login'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-TutorBridge-muted">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={switchMode}
            className="font-medium text-TutorBridge-accent hover:underline"
          >
            {isSignup ? 'Login' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}
