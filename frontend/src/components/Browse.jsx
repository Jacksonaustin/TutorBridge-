import { useEffect, useState } from 'react'

import { API_URL } from '../config/api.js'

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

function Browse({ user, onOpenConversation }) {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [acceptingId, setAcceptingId] = useState(null)
  const [messagingId, setMessagingId] = useState(null)

  const [selectedSubject, setSelectedSubject] =
    useState('All Subjects')

  const [selectedStatus, setSelectedStatus] =
    useState('All Statuses')

  useEffect(() => {
    fetch(`${API_URL}/api/requests`, {
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Not Authorized.')
        }

        return response.json()
      })
      .then((data) => {
        setRequests(
          Array.isArray(data.requests)
            ? data.requests
            : []
        )
      })
      .catch(() => {
        setRequests([])
        setError(
          'Could not load requests — are you signed in?'
        )
      })
  }, [])

  function getId(value) {
    if (!value) {
      return null
    }

    if (typeof value === 'object') {
      return value._id || value.id
    }

    return value
  }

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
        setError(
          data.message ||
            'Unable to accept request.'
        )
        return
      }

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId
            ? data.request
            : request
        )
      )
    } catch {
      setError('Unable to reach the server.')
    } finally {
      setAcceptingId(null)
    }
  }

  async function handleMessage(request) {
    setError('')
    setMessagingId(request._id)

    const currentUserId = getId(user)
    const studentId = getId(request.studentId)
    const tutorId = getId(request.tutorId)

    let otherUserId = null

    if (
      currentUserId &&
      studentId &&
      String(currentUserId) === String(studentId)
    ) {
      otherUserId = tutorId
    } else if (
      currentUserId &&
      tutorId &&
      String(currentUserId) === String(tutorId)
    ) {
      otherUserId = studentId
    }

    if (!otherUserId) {
      setError(
        'Unable to determine the other user for this request.'
      )
      setMessagingId(null)
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/conversations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            participantId: otherUserId,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.message ||
            'Unable to open conversation.'
        )
        return
      }

      onOpenConversation(data.conversation._id)
    } catch {
      setError('Unable to reach the server.')
    } finally {
      setMessagingId(null)
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
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-TutorBridge-text sm:text-3xl">
        Browse Requests
      </h1>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row">
        <div className="w-full sm:w-auto">
          <label
            htmlFor="subjectFilter"
            className="mb-2 block text-sm font-medium text-TutorBridge-text"
          >
            Filter by subject
          </label>

          <select
            id="subjectFilter"
            value={selectedSubject}
            onChange={(event) =>
              setSelectedSubject(event.target.value)
            }
            className="w-full rounded-md bg-TutorBridge-input px-3 py-2.5 text-TutorBridge-text focus:outline-none sm:w-auto"
          >
            {subjects.map((subject) => (
              <option
                key={subject}
                value={subject}
              >
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <label
            htmlFor="statusFilter"
            className="mb-2 block text-sm font-medium text-TutorBridge-text"
          >
            Filter by status
          </label>

          <select
            id="statusFilter"
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(event.target.value)
            }
            className="w-full rounded-md bg-TutorBridge-input px-3 py-2.5 text-TutorBridge-text focus:outline-none sm:w-auto"
          >
            {statuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-3 text-sm text-TutorBridge-muted sm:text-base">
        {filteredRequests.length} requests found
      </p>

      {error && (
        <p className="mt-4 text-sm text-TutorBridge-danger">
          {error}
        </p>
      )}

      <div className="mt-5 space-y-4 sm:mt-6">
        {filteredRequests.map((request) => {
          const studentId = getId(request.studentId)
          const tutorId = getId(request.tutorId)
          const currentUserId = getId(user)

          const isOwnRequest =
            studentId &&
            currentUserId &&
            String(studentId) === String(currentUserId)

          const isTutor =
            tutorId &&
            currentUserId &&
            String(tutorId) === String(currentUserId)

          const isAccepted = request.status === 'accepted'
          const isOpeningMessage = messagingId === request._id
          const isAccepting = acceptingId === request._id

          return (
            <div
              key={request._id}
              className="rounded-lg border border-TutorBridge-input bg-TutorBridge-dark p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <h2 className="break-words text-lg font-semibold text-TutorBridge-text">
                    {request.subject}
                  </h2>

                  <p className="mt-1 break-words font-medium text-TutorBridge-text">
                    {request.topic}
                  </p>
                </div>

                <span className="shrink-0 rounded-md bg-TutorBridge-input px-2.5 py-1 text-xs text-TutorBridge-muted sm:px-3 sm:text-sm">
                  {request.status}
                </span>
              </div>

              <p className="mt-4 break-words text-sm leading-6 text-TutorBridge-muted sm:text-base">
                {request.description}
              </p>

              <div className="mt-4 text-sm text-TutorBridge-muted">
                <p className="break-words">
                  Requested by:{' '}
                  {request.studentId?.name ||
                    'Unknown student'}
                </p>

                <p>
                  Date:{' '}
                  {request.requestedDate?.slice(0, 10)}
                </p>

                <p>
                  Time: {request.requestedTime}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isAccepted && isTutor) {
                    handleMessage(request)
                  } else if (!isAccepted && !isOwnRequest) {
                    handleAccept(request._id)
                  }
                }}
                disabled={
                  isOwnRequest ||
                  (isAccepted && !isTutor) ||
                  isOpeningMessage ||
                  isAccepting
                }
                className="mt-5 w-full rounded-md bg-TutorBridge-accent px-4 py-2.5 font-medium text-TutorBridge-on-accent hover:bg-TutorBridge-accent-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isOwnRequest
                  ? 'Your Request'
                  : isAccepted && isTutor
                    ? isOpeningMessage
                      ? 'Opening...'
                      : 'Message'
                    : isAccepted
                      ? 'Accepted'
                      : isAccepting
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
