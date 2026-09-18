'use client'

import { Reminder } from '@/types/reminder'

type ReminderCardProps = {
  reminder: Reminder
  onEdit: (reminder: Reminder) => void
  onDelete: (reminder: Reminder) => void
  onToggle: (reminder: Reminder) => void
  loading: boolean
}

export default function ReminderCard({
  reminder,
  onEdit,
  onDelete,
  onToggle,
  loading,
}: ReminderCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {reminder.name}
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            {reminder.startTime} → {reminder.endTime}
          </p>

          <p className="mt-1 text-sm text-gray-600">
            Every {reminder.interval} minutes
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            reminder.enabled
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {reminder.enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => onToggle(reminder)}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {reminder.enabled ? 'Disable' : 'Enable'}
        </button>

        <button
          onClick={() => onEdit(reminder)}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(reminder)}
          disabled={loading}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  )
}