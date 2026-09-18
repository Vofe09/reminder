# Project Description --- Universal Reminder

## 1. Project Overview

This project is a simple, elegant and universal reminder system designed
initially for personal use by a single user.

The first practical use case is a reminder for eye exercises/eye
charging. The architecture, however, must remain generic so that the
same system can later be used for any recurring reminder.

The project consists of:

-   a web application used to create and manage reminders;
-   a backend and database that act as the central source of truth;
-   Web Push notifications for iPhone;
-   a desktop application for Linux and Windows;
-   a presence/heartbeat mechanism that determines whether the desktop
    application is currently active.

There are **no user accounts in the initial version**. The system is
intentionally designed for one person.

------------------------------------------------------------------------

## 2. Core Concept

The website stores all reminder configurations.

Each reminder contains:

-   Name
-   Start time
-   End time
-   Interval
-   Enabled/disabled status

Example:

``` text
Eye Exercise
Start:    09:00
End:      22:00
Interval: 20 minutes
Enabled:  Yes
```

Reminders repeat **every day**.

The interval is anchored to the reminder's `Start` time rather than the
time at which the reminder was created or edited.

For example:

``` text
Start:    09:00
Interval: 20 minutes
End:      22:00
```

produces occurrences such as:

``` text
09:00
09:20
09:40
10:00
...
21:40
22:00
```

The `End` time is inclusive, meaning an occurrence exactly at the end
time is allowed.

------------------------------------------------------------------------

## 3. Reminder Management

The web application must allow the user to:

-   Add a reminder
-   Edit an existing reminder
-   Delete a reminder
-   Enable a reminder
-   Disable a reminder
-   Send a test notification

The initial UI should remain deliberately simple and elegant.

The reminder engine must not be hardcoded specifically for eye
exercises. A reminder should be a generic entity with a user-defined
name.

Possible future examples:

``` text
Eye Exercise
Drink Water
Take Medication
Stretch
Study
Take a Break
```

------------------------------------------------------------------------

## 4. Notification Architecture

There are two possible notification targets:

1.  iPhone
2.  Desktop computer

The system should automatically select the active notification target.

### Desktop active

If the desktop application is considered active:

``` text
Reminder occurrence
        ↓
Desktop App
        ↓
Desktop notification
```

The iPhone should **not** receive a notification for that occurrence.

### Desktop inactive

If the desktop application is considered inactive:

``` text
Reminder occurrence
        ↓
Server
        ↓
Web Push
        ↓
iPhone
        ↓
Phone notification
```

This creates a failover mechanism:

``` text
Desktop active   → Desktop notification
Desktop inactive → iPhone notification
```

------------------------------------------------------------------------

## 5. iPhone Notifications

The iPhone notification mechanism will use Web Push.

The user will access the web application through Safari and allow
notifications.

The intended experience is based on the website being installed/added to
the iPhone Home Screen so that it behaves as a web application.

The initial setup should include a way to verify that notifications
work.

The web application should therefore provide a:

``` text
Send Test Notification
```

action.

If the user has not granted notification permission or has not completed
the required iOS web-app setup, the application should make this state
clear to the user.

------------------------------------------------------------------------

## 6. Desktop Application

A separate desktop application will be developed for:

-   Linux
-   Windows

The desktop application will:

1.  Start automatically with the operating system.
2.  Connect to the backend.
3.  Synchronize the current reminder configuration.
4.  Determine upcoming reminder occurrences.
5.  Display desktop notifications when appropriate.
6.  Send a heartbeat to the backend.
7.  Stop being considered active when its heartbeat expires.

The desktop application is considered active simply when the application
itself is running.

The system does **not** distinguish between:

-   an unlocked computer;
-   a locked computer;
-   an actively used computer.

For the initial version:

``` text
Desktop App running = Desktop active
```

If the desktop application is closed, the server should eventually
consider the desktop inactive.

------------------------------------------------------------------------

## 7. Desktop Presence / Heartbeat

The desktop application will send a heartbeat to the backend every:

``` text
4 minutes
```

The backend will consider the desktop application active while its
latest heartbeat is sufficiently recent.

The inactivity threshold is:

``` text
10 minutes
```

Conceptually:

``` text
Heartbeat every 4 minutes
        +
No heartbeat for 10 minutes
        ↓
Desktop considered inactive
```

Example:

``` text
15:00  heartbeat
15:04  heartbeat
15:08  heartbeat
15:12  heartbeat
```

If the desktop application is closed after 15:12 and no further
heartbeat arrives, the server will eventually transition the device to
inactive.

The exact implementation may use a `last_seen` timestamp and compare it
with the current server time.

------------------------------------------------------------------------

## 8. Internet Assumption

The desktop application is designed under the assumption that the
computer has a reliable Internet connection.

Loss of Internet connectivity on the desktop is **not a primary scenario
that the first version needs to handle**.

The architecture may naturally fail over to the iPhone if the server
stops receiving heartbeats, but offline-first desktop reminder delivery
is not a required feature of the initial project.

------------------------------------------------------------------------

## 9. Synchronization

The backend is the central source of truth for reminder configuration.

When the desktop application starts, it retrieves the current reminder
configuration from the backend.

The desktop application should also periodically synchronize with the
backend so that changes made on the website are reflected on the
computer.

For the initial implementation, periodic HTTP synchronization is
sufficient.

A real-time WebSocket/SSE synchronization layer is **not required** for
the first version.

The intended architecture is therefore:

``` text
Website
   ↓
Backend / Database
   ↓
Desktop App
```

The desktop application must not become an independent source of truth
for reminder configuration.

------------------------------------------------------------------------

## 10. Multiple Reminders

The system supports multiple reminders simultaneously.

Example:

``` text
Eye Exercise     every 20 minutes
Drink Water      every 30 minutes
Stretch          every 60 minutes
```

If multiple reminders occur at exactly the same time, they should be
**combined into one notification** rather than generating several
separate notifications.

Example:

``` text
09:00

Eye Exercise
Drink Water
```

becomes:

``` text
🔔 Eye Exercise + Drink Water
```

The exact visual/textual formatting of combined notifications can be
defined during implementation.

------------------------------------------------------------------------

## 11. Reminder Scheduling Rules

Reminder occurrences are generated from the reminder's `Start` time and
interval.

Example:

``` text
Start: 09:00
Interval: 20 minutes
End: 10:00
```

Occurrences:

``` text
09:00
09:20
09:40
10:00
```

The end occurrence is included because the end time is inclusive.

If a reminder is created or edited after its start time, the system
should not restart the interval from the current time.

Example:

``` text
Start: 09:00
Interval: 20 minutes
Current time: 15:13
```

The next occurrence is:

``` text
15:20
```

not:

``` text
15:33
```

------------------------------------------------------------------------

## 12. Daily Repetition

Every enabled reminder repeats daily according to its configured
schedule.

Example:

``` text
Start: 09:00
End: 22:00
Interval: 20 minutes
```

applies every day until the reminder is disabled or deleted.

There is no date-specific scheduling requirement in the initial version.

------------------------------------------------------------------------

## 13. Proposed High-Level Architecture

``` text
                         ┌──────────────────────┐
                         │       WEB APP        │
                         │                      │
                         │ Reminder Management  │
                         │ Test Notification    │
                         └──────────┬───────────┘
                                    │
                                  HTTPS
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       BACKEND        │
                         │                      │
                         │ REST API             │
                         │ Reminder Logic       │
                         │ Device Presence      │
                         │ Push Service         │
                         └──────────┬───────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                  ┌──────────────┐      ┌──────────────┐
                  │   DATABASE   │      │  WEB PUSH    │
                  │              │      │              │
                  │ Reminders    │      │ iPhone       │
                  │ Devices      │      │ Subscription │
                  └──────────────┘      └──────┬───────┘
                                               │
                                               ▼
                                            iPhone
                                          Notification


                  ┌────────────────────────────┐
                  │       DESKTOP APP           │
                  │                            │
                  │ Linux / Windows            │
                  │                            │
                  │ • Startup                  │
                  │ • Sync                     │
                  │ • Local scheduling         │
                  │ • Notifications            │
                  │ • Heartbeat                │
                  └────────────┬───────────────┘
                               │
                             HTTPS
                               │
                               ▼
                            BACKEND
```

------------------------------------------------------------------------

## 14. Data Model --- Initial Concept

### Reminder

A reminder should contain at least:

``` text
id
name
start_time
end_time
interval_value
interval_unit
enabled
created_at
updated_at
```

Example:

``` text
id:             1
name:           Eye Exercise
start_time:     09:00
end_time:       22:00
interval_value: 20
interval_unit:  minutes
enabled:        true
```

Although the first use case only requires minutes, the model should
remain generic enough to support other interval units later if desired.

### Device

The system should maintain device presence information.

Conceptually:

``` text
id
type
name
last_seen
created_at
```

Example:

``` text
id:         1
type:       desktop
name:       Linux PC
last_seen:  2026-09-18 15:54
```

### Push Subscription

The iPhone's Web Push subscription should be stored so the backend can
deliver notifications.

Conceptually:

``` text
id
device_id
endpoint
keys
created_at
```

------------------------------------------------------------------------

## 15. Timezone

The system should explicitly account for the user's timezone.

The initial deployment is expected to use the user's local timezone.

A timezone setting should exist at the architecture level even though
the first version has only one user.

This avoids ambiguity around reminder times and provides a cleaner path
toward future multi-device and account support.

------------------------------------------------------------------------

## 16. What Is Deliberately Out of Scope for the Initial Version

The first version should not include:

-   User registration
-   User accounts
-   OAuth
-   Multiple users
-   Social features
-   Native mobile application
-   WebSocket-based synchronization
-   Complex calendar functionality
-   Date-specific schedules
-   Cron-expression-style scheduling
-   Advanced analytics
-   Offline-first desktop operation
-   Complex notification rules
-   Real user-activity detection on the computer

The goal is to keep the first implementation small while establishing a
sound architecture.

------------------------------------------------------------------------

## 17. Future Extensibility

The project should be designed so that additional functionality can be
added without redesigning the core reminder engine.

Potential future additions include:

-   User accounts
-   Multiple users
-   Multiple phones/computers
-   Android support
-   Native mobile applications
-   More advanced recurring schedules
-   Specific days of the week
-   Date ranges
-   Notification history
-   Reminder statistics
-   Custom notification messages
-   Snooze functionality
-   Reminder categories
-   Sound/vibration preferences
-   More sophisticated device presence detection

These features are not part of the initial implementation.

------------------------------------------------------------------------

## 18. Core Design Principles

The project should follow these principles:

### Simplicity

The application should be immediately understandable without a tutorial.

### Elegance

The interface should be minimal, clean and visually coherent rather than
feature-heavy.

### Reliability

The notification routing logic should prefer the active desktop device
and fall back to the iPhone when the desktop is no longer considered
active.

### Generic Reminder Engine

Eye exercises are the first use case, not a hardcoded product
limitation.

### Single Source of Truth

The backend/database is authoritative for reminder configuration.

### Minimal Infrastructure

The initial implementation should use straightforward HTTP APIs and
avoid unnecessary real-time infrastructure.

### Extensibility

The data model and architecture should allow accounts, additional
devices and more sophisticated schedules to be introduced later without
rewriting the core system.

------------------------------------------------------------------------

## 19. Current Project State

This document describes the agreed product and architecture concept
**before development stages are defined**.

The next planning step, when requested, will be to convert this
description into a staged development plan covering the implementation
order, milestones, technical decisions, testing and deployment.

No development stages are defined in this document yet.
