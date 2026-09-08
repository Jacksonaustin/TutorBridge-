import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Messages({ user, initialConversationId }) {
  const [conversations, setConversations] = useState([])
  const [contacts, setContacts] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [openingContactId, setOpeningContactId] = useState(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const currentUserId = user?._id || user?.id

  function getId(value) {
    if (!value) {
      return null
    }

    if (typeof value === 'object') {
      return value._id || value.id
    }

    return value
  }

  // Load existing conversations and accepted tutoring partners.
  useEffect(() => {
    if (!user) {
      setConversations([])
      setContacts([])
      setSelectedConversationId(null)
      setLoading(false)
      return
    }

    async function loadMessagingData() {
      setLoading(true)
      setError('')

      try {
        const [conversationResponse, requestResponse] = await Promise.all([
          fetch(`${API_URL}/api/conversations`, {
            credentials: 'include',
          }),

          fetch(`${API_URL}/api/requests/mine`, {
            credentials: 'include',
          }),
        ])

        const conversationData = await conversationResponse.json()
        const requestData = await requestResponse.json()

        if (!conversationResponse.ok) {
          setError(
            conversationData.message ||
              'Unable to load conversations.'
          )
          return
        }

        if (!requestResponse.ok) {
          setError(
            requestData.message ||
              'Unable to load tutoring partners.'
          )
          return
        }

        const conversationList = Array.isArray(
          conversationData.conversations
        )
          ? conversationData.conversations
          : []

        const requestList = Array.isArray(requestData.requests)
          ? requestData.requests
          : []

        setConversations(conversationList)

        const acceptedRequests = requestList.filter(
          (request) => request.status === 'accepted'
        )

        const contactMap = new Map()

        acceptedRequests.forEach((request) => {
          const studentId = getId(request.studentId)
          const tutorId = getId(request.tutorId)

          let otherUser = null

          if (
            studentId &&
            currentUserId &&
            String(studentId) === String(currentUserId)
          ) {
            otherUser = request.tutorId
          } else if (
            tutorId &&
            currentUserId &&
            String(tutorId) === String(currentUserId)
          ) {
            otherUser = request.studentId
          }

          const otherUserId = getId(otherUser)

          if (
            otherUserId &&
            !contactMap.has(String(otherUserId))
          ) {
            contactMap.set(String(otherUserId), {
              id: otherUserId,
              name: otherUser?.name || 'Unknown student',
              major: otherUser?.major || 'No major listed',
            })
          }
        })

        setContacts(Array.from(contactMap.values()))

        if (initialConversationId) {
          setSelectedConversationId(initialConversationId)
        }
      } catch {
        setError('Unable to reach the server.')
      } finally {
        setLoading(false)
      }
    }

    loadMessagingData()
  }, [user, initialConversationId, currentUserId])

  // Load messages and refresh them every 3 seconds.
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([])
      return
    }

    let firstLoad = true

    async function loadMessages() {
      if (firstLoad) {
        setLoadingMessages(true)
      }

      try {
        const response = await fetch(
          `${API_URL}/api/conversations/${selectedConversationId}/messages`,
          {
            credentials: 'include',
          }
        )

        const data = await response.json()

        if (!response.ok) {
          if (firstLoad) {
            setError(
              data.message || 'Unable to load messages.'
            )
          }
          return
        }

        const messageList = Array.isArray(data.messages)
          ? data.messages
          : []

        setMessages(messageList)

        // Update the preview on the left with the newest message.
        if (messageList.length > 0) {
          const newestMessage =
            messageList[messageList.length - 1]

          setConversations((currentConversations) =>
            currentConversations.map((conversation) =>
              conversation._id === selectedConversationId
                ? {
                    ...conversation,
                    lastMessage: newestMessage.text,
                    lastMessageTimestamp:
                      newestMessage.createdAt,
                  }
                : conversation
            )
          )
        }

        // Mark messages in the open conversation as read.
        await fetch(
          `${API_URL}/api/conversations/${selectedConversationId}/read`,
          {
            method: 'POST',
            credentials: 'include',
          }
        )
      } catch {
        if (firstLoad) {
          setError('Unable to reach the server.')
        }
      } finally {
        if (firstLoad) {
          setLoadingMessages(false)
          firstLoad = false
        }
      }
    }

    // Load immediately.
    loadMessages()

    // Then check for new messages every 3 seconds.
    const interval = setInterval(loadMessages, 3000)

    // Stop polling when leaving/changing conversations.
    return () => {
      clearInterval(interval)
    }
  }, [selectedConversationId])

  async function handleOpenContact(contact) {
    setError('')
    setOpeningContactId(contact.id)

    const existingConversation = conversations.find(
      (conversation) =>
        String(getId(conversation.otherParticipant)) ===
        String(contact.id)
    )

    if (existingConversation) {
      setSelectedConversationId(existingConversation._id)
      setOpeningContactId(null)
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
            participantId: contact.id,
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

      setConversations((currentConversations) => {
        const alreadyExists = currentConversations.some(
          (conversation) =>
            conversation._id === data.conversation._id
        )

        if (alreadyExists) {
          return currentConversations
        }

        return [
          ...currentConversations,
          data.conversation,
        ]
      })

      setSelectedConversationId(data.conversation._id)
    } catch {
      setError('Unable to reach the server.')
    } finally {
      setOpeningContactId(null)
    }
  }

  async function handleSend(event) {
    event.preventDefault()

    const text = messageText.trim()

    if (!text || !selectedConversationId || sending) {
      return
    }

    setSending(true)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/api/conversations/${selectedConversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            text,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.message || 'Unable to send message.'
        )
        return
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        data.message,
      ])

      setConversations((currentConversations) =>
        currentConversations.map((conversation) =>
          conversation._id === selectedConversationId
            ? {
                ...conversation,
                lastMessage: data.message.text,
                lastMessageTimestamp:
                  data.message.createdAt,
              }
            : conversation
        )
      )

      setMessageText('')
    } catch {
      setError('Unable to reach the server.')
    } finally {
      setSending(false)
    }
  }

  function getSenderId(message) {
    return getId(message.senderId)
  }

  function formatTime(dateString) {
    if (!dateString) {
      return ''
    }

    return new Date(dateString).toLocaleString()
  }

  const selectedConversation = conversations.find(
    (conversation) =>
      conversation._id === selectedConversationId
  )

  const selectedContact = contacts.find((contact) => {
    if (!selectedConversation) {
      return false
    }

    return (
      String(contact.id) ===
      String(getId(selectedConversation.otherParticipant))
    )
  })

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-TutorBridge-text">
          Messages
        </h1>

        <p className="mt-3 text-TutorBridge-muted">
          Sign in to view your conversations.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Tutoring partners */}
      <div className="flex w-80 shrink-0 flex-col border-r border-TutorBridge-input bg-TutorBridge-dark">
        <div className="border-b border-TutorBridge-input p-5">
          <h1 className="text-2xl font-bold text-TutorBridge-text">
            Messages
          </h1>

          <p className="mt-1 text-sm text-TutorBridge-muted">
            Your tutoring partners
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-5 text-TutorBridge-muted">
              Loading...
            </p>
          ) : contacts.length === 0 ? (
            <p className="p-5 text-TutorBridge-muted">
              No accepted tutoring requests yet.
            </p>
          ) : (
            contacts.map((contact) => {
              const conversation = conversations.find(
                (item) =>
                  String(getId(item.otherParticipant)) ===
                  String(contact.id)
              )

              const selected =
                conversation &&
                conversation._id === selectedConversationId

              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() =>
                    handleOpenContact(contact)
                  }
                  disabled={
                    openingContactId === contact.id
                  }
                  className={`w-full border-b border-TutorBridge-input p-4 text-left transition-colors ${
                    selected
                      ? 'bg-TutorBridge-input'
                      : 'hover:bg-TutorBridge-input'
                  }`}
                >
                  <p className="font-semibold text-TutorBridge-text">
                    {contact.name}
                  </p>

                  <p className="mt-1 text-xs text-TutorBridge-muted">
                    {contact.major}
                  </p>

                  <p className="mt-2 truncate text-sm text-TutorBridge-muted">
                    {openingContactId === contact.id
                      ? 'Opening...'
                      : conversation?.lastMessage ||
                        'No messages yet'}
                  </p>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Conversation */}
      <div className="flex min-w-0 flex-1 flex-col">
        {error && (
          <div className="border-b border-TutorBridge-input px-5 py-3 text-sm text-TutorBridge-danger">
            {error}
          </div>
        )}

        {!selectedConversation ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-TutorBridge-text">
                No conversation selected
              </h2>

              <p className="mt-2 text-TutorBridge-muted">
                Select one of your tutoring partners to start messaging.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Conversation header */}
            <div className="border-b border-TutorBridge-input bg-TutorBridge-dark p-5">
              <h2 className="text-xl font-semibold text-TutorBridge-text">
                {selectedConversation.otherParticipant?.name ||
                  selectedContact?.name ||
                  'Unknown student'}
              </h2>

              <p className="text-sm text-TutorBridge-muted">
                {selectedConversation.otherParticipant?.major ||
                  selectedContact?.major ||
                  'No major listed'}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingMessages ? (
                <p className="text-TutorBridge-muted">
                  Loading messages...
                </p>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-TutorBridge-muted">
                    No messages yet. Say hello!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const senderId = getSenderId(message)

                    const isMine =
                      currentUserId &&
                      senderId &&
                      String(senderId) ===
                        String(currentUserId)

                    return (
                      <div
                        key={message._id}
                        className={`flex ${
                          isMine
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-3 ${
                            isMine
                              ? 'bg-TutorBridge-accent text-TutorBridge-text'
                              : 'bg-TutorBridge-dark text-TutorBridge-text'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.text}
                          </p>

                          <p
                            className={`mt-1 text-xs ${
                              isMine
                                ? 'text-TutorBridge-text/70'
                                : 'text-TutorBridge-muted'
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Send message */}
            <form
              onSubmit={handleSend}
              className="border-t border-TutorBridge-input bg-TutorBridge-dark p-4"
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(event) =>
                    setMessageText(event.target.value)
                  }
                  maxLength={2000}
                  placeholder={`Message ${
                    selectedConversation.otherParticipant?.name ||
                    selectedContact?.name ||
                    'student'
                  }`}
                  className="min-w-0 flex-1 rounded-md bg-TutorBridge-input px-4 py-3 text-TutorBridge-text outline-none placeholder:text-TutorBridge-muted focus:ring-2 focus:ring-TutorBridge-accent"
                />

                <button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  className="rounded-md bg-TutorBridge-accent px-5 py-3 font-medium text-TutorBridge-text transition-colors hover:bg-TutorBridge-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default Messages