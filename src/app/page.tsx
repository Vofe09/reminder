'use client'

import { useEffect, useState } from 'react'
import ReminderCard from '@/components/ReminderCard'
import {
  createReminder,
  deleteReminder,
  disableReminder,
  enableReminder,
  getReminders,
  updateReminder,
} from '@/lib/api/reminders'
import { Reminder } from '@/types/reminder'
import {
  registerPush,
  getPushStatus,
} from '@/lib/pushClient'

type FormData = {
  name: string
  startTime: string
  endTime: string
  interval: string
}

const emptyForm: FormData = {
  name: '',
  startTime: '09:00',
  endTime: '22:00',
  interval: '20',
}

export default function Home() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyForm)

  const [pushStatus, setPushStatus] = useState<
    'unknown' | 'enabled' | 'disabled'
  >('unknown')

  const [pushLoading, setPushLoading] = useState(false)

  async function loadReminders() {
    try {
      setError(null)
      const data = await getReminders()
      setReminders(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load reminders'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReminders()

    getPushStatus()
      .then((enabled) => {
        setPushStatus(enabled ? 'enabled' : 'disabled')
      })
      .catch(() => {
        setPushStatus('disabled')
      })
  }, [])
  function openCreateForm() {
    setEditingReminder(null)
    setFormData(emptyForm)
    setShowForm(true)
  }

  function openEditForm(reminder: Reminder) {
    setEditingReminder(reminder)

    setFormData({
      name: reminder.name,
      startTime: reminder.startTime,
      endTime: reminder.endTime,
      interval: String(reminder.interval),
    })

    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingReminder(null)
    setFormData(emptyForm)
  }

  async function handleEnablePush() {
    try {
      setPushLoading(true)
      setError(null)

      await registerPush()

      setPushStatus('enabled')
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to enable notifications'
      )
    } finally {
      setPushLoading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const interval = Number(formData.interval)

    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    if (!Number.isInteger(interval) || interval < 1) {
      setError('Interval must be at least 1 minute')
      return
    }

    if (formData.endTime < formData.startTime) {
      setError('End time cannot be earlier than start time')
      return
    }

    try {
      setError(null)

      const data = {
        name: formData.name.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        interval,
      }

      if (editingReminder) {
        const updated = await updateReminder(
          editingReminder.id,
          data
        )

        setReminders((current) =>
          current.map((reminder) =>
            reminder.id === updated.id ? updated : reminder
          )
        )
      } else {
        const created = await createReminder(data)
        setReminders((current) => [...current, created])
      }

      closeForm()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to save reminder'
      )
    }
  }

  async function handleToggle(reminder: Reminder) {
    try {
      setActionLoading(reminder.id)
      setError(null)

      const updated = reminder.enabled
        ? await disableReminder(reminder.id)
        : await enableReminder(reminder.id)

      setReminders((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update reminder'
      )
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(reminder: Reminder) {
    const confirmed = window.confirm(
      `Delete "${reminder.name}"?`
    )

    if (!confirmed) return

    try {
      setActionLoading(reminder.id)
      setError(null)

      await deleteReminder(reminder.id)

      setReminders((current) =>
        current.filter((item) => item.id !== reminder.id)
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to delete reminder'
      )
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Universal Reminder
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your reminders
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleEnablePush}
              disabled={pushLoading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {pushLoading
                ? 'Enabling...'
                : pushStatus === 'enabled'
                  ? '🔔 Notifications Enabled'
                  : '🔔 Enable iPhone Notifications'}
            </button>

            <button
              onClick={openCreateForm}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              + Add Reminder
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              {editingReminder
                ? 'Edit Reminder'
                : 'New Reminder'}
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Name
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      name: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
                  placeholder="Eye Exercise"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Start
                  </label>

                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        startTime: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    End
                  </label>

                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        endTime: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Interval (minutes)
                </label>

                <input
                  type="number"
                  min="1"
                  value={formData.interval}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      interval: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                {editingReminder ? 'Save' : 'Create'}
              </button>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 space-y-4">
          {loading ? (
            <p className="text-sm text-gray-500">
              Loading reminders...
            </p>
          ) : reminders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="text-gray-500">
                No reminders yet.
              </p>

              <button
                onClick={openCreateForm}
                className="mt-3 text-sm font-medium text-black underline"
              >
                Create your first reminder
              </button>
            </div>
          ) : (
            reminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onEdit={openEditForm}
                onDelete={handleDelete}
                onToggle={handleToggle}
                loading={actionLoading === reminder.id}
              />
            ))
          )}
        </div>
      </div>
    </main>
  )
}