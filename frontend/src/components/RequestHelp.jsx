import { useState } from 'react'

import { API_URL } from '../config/api.js'

function RequestHelp() {
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [requestedDate, setRequestedDate] = useState('')
  const [requestedTime, setRequestedTime] = useState('')

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage('')
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subject,
          topic,
          description,
          requestedDate,
          requestedTime,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (Array.isArray(data.errors)) {
          setError(data.errors.join(' '))
        } else {
          setError(data.message || 'Unable to create request.')
        }
        return
      }

      setMessage('Tutoring request posted successfully!')
      setSubject('')
      setTopic('')
      setDescription('')
      setRequestedDate('')
      setRequestedTime('')
    } catch {
      setError('Unable to reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold text-TutorBridge-text sm:text-3xl">
          Request Tutoring
        </h1>

        <p className="mb-5 text-sm text-TutorBridge-muted sm:mb-6 sm:text-base">
          Tell other students what you need help with.
        </p>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg bg-TutorBridge-dark p-4 sm:p-6"
        >
          <div className="mb-4">
            <label
              htmlFor="subject"
              className="mb-1 block text-sm font-medium text-TutorBridge-text"
            >
              Subject
            </label>

            <select
              id="subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
              className="w-full rounded-md bg-TutorBridge-input px-3 py-2.5 text-TutorBridge-text focus:outline-none"
            >
              <option value="">Select a subject</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Engineering">Engineering</option>
              <option value="Biology">Biology</option>
              <option value="Psychology">Psychology</option>
              <option value="Nursing">Nursing</option>
              <option value="Business">Business</option>
              <option value="Education">Education</option>
              <option value="Criminal Justice">Criminal Justice</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="topic"
              className="mb-1 block text-sm font-medium text-TutorBridge-text"
            >
              Topic
            </label>

            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              required
              maxLength={150}
              placeholder="Example: Java recursion"
              className="w-full rounded-md bg-TutorBridge-input px-3 py-2.5 text-TutorBridge-text placeholder:text-TutorBridge-muted focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-TutorBridge-text"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              maxLength={2000}
              rows={5}
              placeholder="Describe what you need help with..."
              className="w-full resize-none rounded-md bg-TutorBridge-input px-3 py-2.5 text-TutorBridge-text placeholder:text-TutorBridge-muted focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="requestedDate"
                className="mb-1 block text-sm font-medium text-TutorBridge-text"
              >
                Date
              </label>

              <input
                id="requestedDate"
                type="date"
                value={requestedDate}
                onChange={(event) => setRequestedDate(event.target.value)}
                required
                className="w-full rounded-md bg-TutorBridge-input px-3 py-2.5 text-TutorBridge-text focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="requestedTime"
                className="mb-1 block text-sm font-medium text-TutorBridge-text"
              >
                Time
              </label>

              <input
                id="requestedTime"
                type="time"
                value={requestedTime}
                onChange={(event) => setRequestedTime(event.target.value)}
                required
                className="w-full rounded-md bg-TutorBridge-input px-3 py-2.5 text-TutorBridge-text focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-TutorBridge-danger">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-4 text-sm text-TutorBridge-online">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-md bg-TutorBridge-accent px-5 py-2.5 font-medium text-TutorBridge-on-accent hover:bg-TutorBridge-accent-hover disabled:opacity-60 sm:w-auto"
          >
            {loading ? 'Posting...' : 'Post Request'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RequestHelp
