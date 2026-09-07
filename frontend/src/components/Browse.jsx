import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:5000'

const subjects = [
  'All Subjects',
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

const statuses = [
  'All Statuses',
  'Pending',
  'Accepted',
]

function Browse({ user }) {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [acceptingId, setAcceptingId] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState('All Subjects')
  const [selectedStatus, setSelectedStatus] = useState('All Statuses')

  useEffect(() => {
    fetch(`${API_URL}/api/requests`, {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        setRequests(data.requests)
      })
  }, [])

  async function handleAccept(requestId) {
    setError('')
    setAcceptingId(requestId)

    try {
      const response = await fetch(
        `${API_URL}/api/requests/${requestId}/accept`,
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Unable to accept request.')
        return
      }

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId
            ? { ...request, status: 'accepted' }
            : request
        )
      )
    } catch {
      setError('Unable to reach the server.')
    } finally {
      setAcceptingId(null)
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSubject =
      selectedSubject === 'All Subjects' ||
      request.subject === selectedSubject

    const matchesStatus =
      selectedStatus === 'All Statuses' ||
      request.status === selectedStatus.toLowerCase()

    return matchesSubject && matchesStatus
  })

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-TutorBridge-text">
        Browse Requests
      </h1>

      <div className="mt-4 flex gap-4">
        <div>
          <label
            htmlFor="subjectFilter"
            className="mb-2 block text-sm font-medium text-TutorBridge-text"
          >
            Filter by subject
          </label>

          <select
            id="subjectFilter"
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value)}
            className="rounded-md bg-TutorBridge-input px-3 py-2 text-TutorBridge-text focus:outline-none"
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="statusFilter"
            className="mb-2 block text-sm font-medium text-TutorBridge-text"
          >
            Filter by status
          </label>

          <select
            id="statusFilter"
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="rounded-md bg-TutorBridge-input px-3 py-2 text-TutorBridge-text focus:outline-none"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-3 text-TutorBridge-muted">
        {filteredRequests.length} requests found
      </p>

      {error && (
        <p className="mt-4 text-sm text-TutorBridge-danger">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-4">
        {filteredRequests.map((request) => {
          const studentId =
            typeof request.studentId === 'object'
              ? request.studentId?._id
              : request.studentId

          const currentUserId = user?._id || user?.id

          const isOwnRequest =
            studentId &&
            currentUserId &&
            String(studentId) === String(currentUserId)

          const isAccepted = request.status === 'accepted'

          return (
            <div
              key={request._id}
              className="rounded-lg border border-TutorBridge-input bg-TutorBridge-dark p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-TutorBridge-text">
                    {request.subject}
                  </h2>

                  <p className="mt-1 font-medium text-TutorBridge-text">
                    {request.topic}
                  </p>
                </div>

                <span className="rounded-md bg-TutorBridge-input px-3 py-1 text-sm text-TutorBridge-muted">
                  {request.status}
                </span>
              </div>

              <p className="mt-4 text-TutorBridge-muted">
                {request.description}
              </p>

              <div className="mt-4 text-sm text-TutorBridge-muted">
                <p>
                  Requested by:{' '}
                  {request.studentId?.name || 'Unknown student'}
                </p>

                <p>
                  Date: {request.requestedDate?.slice(0, 10)}
                </p>

                <p>
                  Time: {request.requestedTime}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAccept(request._id)}
                disabled={
                  isOwnRequest ||
                  isAccepted ||
                  acceptingId === request._id
                }
                className="mt-5 rounded-md bg-TutorBridge-accent px-4 py-2 font-medium text-TutorBridge-text hover:bg-TutorBridge-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAccepted
                  ? 'Accepted'
                  : isOwnRequest
                    ? 'Your Request'
                    : acceptingId === request._id
                      ? 'Accepting...'
                      : 'Volunteer'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Browse