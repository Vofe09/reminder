'use client'

import { useEffect, useState } from 'react'
import {
  getPushStatus,
  registerPush,
} from '@/lib/pushClient'

type Status = {
  supported: boolean
  subscribed: boolean
}

export default function Home() {
  const [status, setStatus] = useState<Status>({
    supported: false,
    subscribed: false,
  })

  const [message, setMessage] = useState('Checking...')
  const [loading, setLoading] = useState(false)

  async function refreshStatus() {
    try {
      const result = await getPushStatus()

      setStatus(result)

      if (!result.supported) {
        setMessage('Web Push is not supported')
      } else if (result.subscribed) {
        setMessage('iPhone notifications are registered')
      } else {
        setMessage('iPhone notifications are not registered')
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to check status'
      )
    }
  }

  async function handleRegisterPush() {
    setLoading(true)
    setMessage('Registering...')

    try {
      await registerPush()

      setMessage('Push notifications registered successfully')

      await refreshStatus()
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to register push'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleTestNotification() {
    setLoading(true)
    setMessage('Sending test notification...')

    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to send notification')
      }

      setMessage(
        `Notification sent. Sent: ${data.sent}, removed: ${data.removed}`
      )
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to send notification'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshStatus()
  }, [])

  return (
    <main
      style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: 40,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>Universal Reminder</h1>

      <p>
        Web Push test interface
      </p>

      <hr />

      <h2>iPhone Push</h2>

      <p>
        Status:{' '}
        <strong>
          {status.subscribed
            ? 'Registered'
            : 'Not registered'}
        </strong>
      </p>

      <p>{message}</p>

      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          marginTop: 20,
        }}
      >
        <button
          onClick={handleRegisterPush}
          disabled={loading || status.subscribed}
          style={{
            padding: '10px 16px',
            cursor: loading || status.subscribed
              ? 'default'
              : 'pointer',
          }}
        >
          Enable iPhone Notifications
        </button>

        <button
          onClick={handleTestNotification}
          disabled={loading || !status.subscribed}
          style={{
            padding: '10px 16px',
            cursor: loading || !status.subscribed
              ? 'default'
              : 'pointer',
          }}
        >
          Test Notification
        </button>
      </div>
    </main>
  )
}