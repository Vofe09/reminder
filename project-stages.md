# Project Stages --- Universal Reminder

## Purpose

This document defines the concrete development roadmap for the Universal
Reminder project.

Development is divided into three major phases:

1.  **Working Server**
2.  **Working Linux Application**
3.  **Working Windows Application**

The phases are intentionally sequential. The server becomes the central
foundation first; the Linux application is then implemented and
validated against it; finally the same desktop concept is adapted and
validated for Windows.

------------------------------------------------------------------------

# Phase 1 --- Working Server

## Goal

At the end of Phase 1, the backend must be capable of:

-   storing reminders;
-   creating, editing, deleting and disabling reminders;
-   calculating reminder occurrences;
-   tracking desktop presence;
-   deciding whether a notification should go to desktop or iPhone;
-   delivering Web Push notifications to the iPhone;
-   combining simultaneous reminders;
-   providing an API for desktop clients;
-   surviving normal server restarts without losing reminder data.

The web interface can initially be minimal. The important result of this
phase is a stable backend and notification system.

------------------------------------------------------------------------

## Step 1. Define the Server Architecture

Decide and document:

-   backend framework/runtime;
-   database;
-   API structure;
-   server deployment target;
-   environment variables;
-   Web Push implementation;
-   scheduler architecture;
-   timezone handling.

The server must expose a clean API that both the website and desktop
applications can use.

### Expected result

A written technical architecture and project skeleton.

------------------------------------------------------------------------

## Step 2. Create the Database Schema

Implement the initial database tables/entities.

### `reminders`

Required fields:

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

### `devices`

Required concept:

``` text
id
type
name
last_seen
created_at
```

### `push_subscriptions`

Required concept:

``` text
id
device_id
endpoint
keys
created_at
```

Also define how the user's timezone is stored.

### Expected result

The server can persist all information required by the reminder engine.

------------------------------------------------------------------------

## Step 3. Implement Reminder CRUD API

Implement API endpoints for:

-   list reminders;
-   get one reminder;
-   create reminder;
-   update reminder;
-   delete reminder;
-   enable reminder;
-   disable reminder.

The API must validate:

-   required fields;
-   valid time format;
-   valid interval;
-   `End >= Start`;
-   valid enabled/disabled state.

### Expected result

A reminder can be completely managed through HTTP requests.

------------------------------------------------------------------------

## Step 4. Implement Reminder Scheduling Logic

Create the central reminder calculation logic.

Given:

``` text
Start
End
Interval
```

the server must determine valid daily occurrences.

Example:

``` text
Start:    09:00
End:      10:00
Interval: 20 minutes
```

produces:

``` text
09:00
09:20
09:40
10:00
```

The interval is always anchored to `Start`.

The scheduler must correctly handle:

-   current time before Start;
-   current time exactly at an occurrence;
-   current time between occurrences;
-   current time after End;
-   disabled reminders;
-   multiple reminders;
-   multiple reminders occurring at the same time.

### Expected result

A deterministic scheduling function that can be tested independently
from notification delivery.

------------------------------------------------------------------------

## Step 5. Implement Notification Grouping

Before sending notifications, the server must group reminders with the
same scheduled occurrence.

Example:

``` text
09:00
 ├── Eye Exercise
 └── Drink Water
```

must become one notification rather than two.

The grouping logic should be generic and independent of the specific
reminder names.

### Expected result

One notification event can contain multiple reminder messages.

------------------------------------------------------------------------

## Step 6. Implement Desktop Presence

Implement the desktop heartbeat API.

The desktop client will send a heartbeat every:

``` text
4 minutes
```

The server uses:

``` text
last_seen
```

to determine presence.

Rule:

``` text
current_time - last_seen < 10 minutes
        → desktop active

current_time - last_seen >= 10 minutes
        → desktop inactive
```

The presence check should be based on server time.

### Expected result

The server can reliably determine whether the desktop application is
currently considered active.

------------------------------------------------------------------------

## Step 7. Implement Device Synchronization API

Create the API required by desktop clients to:

-   retrieve the current reminder configuration;
-   identify/update the desktop device;
-   send heartbeat;
-   optionally receive server configuration metadata/version
    information.

The API should be designed so that desktop applications do not need
direct database access.

### Expected result

A desktop client can fully synchronize with the server through HTTP.

------------------------------------------------------------------------

## Step 8. Implement Web Push Registration

Implement the iPhone Web Push subscription flow.

The website should be able to:

1.  request notification permission;
2.  create/retrieve a Push subscription;
3.  send the subscription to the backend;
4.  associate it with the user's device;
5.  allow the backend to send a test notification.

The required Web Push credentials/configuration must be kept
server-side.

### Expected result

The backend can send a test push notification to the configured iPhone.

------------------------------------------------------------------------

## Step 9. Implement Notification Routing

Implement the central decision:

``` text
Is desktop active?
```

If yes:

``` text
Desktop active
→ do not send iPhone push
```

If no:

``` text
Desktop inactive
→ send iPhone push
```

The server must not depend on the desktop application explicitly telling
it to suppress phone notifications for every reminder.

Presence itself determines routing.

### Expected result

The backend can determine the correct notification target automatically.

------------------------------------------------------------------------

## Step 10. Implement the Server Scheduler / Trigger Mechanism

Connect the scheduling logic to the actual notification system.

At each relevant reminder occurrence:

1.  find active reminders;
2.  determine which reminders should trigger;
3.  group simultaneous reminders;
4.  check desktop presence;
5.  route the notification;
6.  record enough information to prevent accidental duplicate delivery.

The implementation must account for server restarts and repeated
scheduler executions.

### Expected result

The server can automatically generate and route real reminder
notifications.

------------------------------------------------------------------------

## Step 11. Add Notification History / Idempotency Protection

The scheduler must not accidentally send the same occurrence repeatedly.

For example, if the scheduler checks the same 09:20 occurrence multiple
times, it must not create multiple identical phone notifications.

A minimal event/dispatch record or equivalent idempotency mechanism
should be introduced.

This does not need to become a full analytics system.

### Expected result

Each reminder occurrence is processed safely exactly once, subject to
normal push-delivery limitations.

------------------------------------------------------------------------

## Step 12. Build Minimal Web Management UI

Create the first usable website interface.

Required functionality:

-   display reminders;
-   add reminder;
-   edit reminder;
-   delete reminder;
-   enable/disable reminder;
-   configure Web Push;
-   send test notification.

The UI should remain simple and elegant.

No accounts are required.

### Expected result

The complete reminder system can be controlled from a browser.

------------------------------------------------------------------------

## Step 13. Server Integration Testing

Test the complete server flow.

Minimum scenarios:

### Reminder scheduling

``` text
09:00 → 09:20 → 09:40 → 10:00
```

### Daily repetition

Verify the same schedule is generated on subsequent days.

### Inclusive End

Verify that an occurrence exactly at `End` is allowed.

### Editing

Change:

``` text
20 min → 30 min
```

and verify future occurrences use the new configuration.

### Disabled reminder

Verify no occurrences are delivered while disabled.

### Simultaneous reminders

Verify multiple reminders become one notification.

### Desktop active

Verify the phone receives nothing.

### Desktop inactive

Verify the phone receives the push.

### Heartbeat expiration

Verify:

``` text
heartbeat
↓
desktop active
↓
no heartbeat for 10+ minutes
↓
desktop inactive
```

### Server restart

Verify reminders remain stored and scheduling continues correctly.

------------------------------------------------------------------------

## Phase 1 Completion Criteria

Phase 1 is complete when:

-   the server is deployed;
-   reminders persist in the database;
-   reminder CRUD works;
-   daily scheduling works;
-   simultaneous reminders are grouped;
-   desktop presence works with 4-minute heartbeat / 10-minute
    threshold;
-   Web Push works on the configured iPhone;
-   notification routing works;
-   duplicate reminder events are prevented;
-   the web interface can manage the complete system.

At this point, the project has a functional reminder backend independent
of any desktop application.

------------------------------------------------------------------------

# Phase 2 --- Working Linux Application

## Goal

At the end of Phase 2, a Linux user can install/start the desktop
application and have the complete reminder workflow operate through the
Linux desktop.

The Linux application must:

-   start with the operating system;
-   synchronize reminders;
-   calculate upcoming notifications;
-   display desktop notifications;
-   send a heartbeat every 4 minutes;
-   stop being considered active when closed;
-   reflect changes made on the website.

------------------------------------------------------------------------

## Step 14. Define the Linux Application Architecture

Decide:

-   programming language/framework;
-   system notification mechanism;
-   application configuration location;
-   startup/autostart mechanism;
-   HTTP client;
-   local scheduling mechanism;
-   logging strategy.

The application should be lightweight and run in the background.

### Expected result

A minimal Linux desktop application can launch and remain running
without a visible main window if desired.

------------------------------------------------------------------------

## Step 15. Implement Server Connection

Implement:

-   server URL configuration;
-   device identification;
-   HTTP requests;
-   error handling;
-   authentication mechanism if one is required for the single-user
    deployment.

The application should be able to communicate with the Phase 1 server.

### Expected result

Linux application can successfully connect to the backend.

------------------------------------------------------------------------

## Step 16. Implement Reminder Synchronization

On startup:

``` text
Launch
  ↓
Connect to server
  ↓
Get reminders
  ↓
Store current configuration in memory
```

Then periodically synchronize with the server.

The application must correctly handle:

-   added reminders;
-   edited reminders;
-   deleted reminders;
-   enabled reminders;
-   disabled reminders.

### Expected result

Linux always operates using the current server configuration.

------------------------------------------------------------------------

## Step 17. Implement Local Reminder Scheduling

Implement the desktop-side scheduler.

The application should determine the next occurrence from:

``` text
Start
End
Interval
Current time
```

The same scheduling rules defined by the server must be used.

The application must not start a new interval from the moment it was
launched.

Example:

``` text
Start: 09:00
Interval: 20 min
Application starts: 15:13
```

Next occurrence:

``` text
15:20
```

------------------------------------------------------------------------

## Step 18. Implement Linux Notifications

Connect scheduled occurrences to the native Linux notification system.

Example:

``` text
🔔 Eye Exercise
Time to rest your eyes.
```

If multiple reminders occur together, display one combined notification.

### Expected result

The user receives real desktop notifications from Linux.

------------------------------------------------------------------------

## Step 19. Implement Heartbeat

Implement:

``` text
heartbeat every 4 minutes
```

The application should send its presence to the server even when no
reminder is currently due.

When the application closes, heartbeat naturally stops.

### Expected result

The server correctly sees:

``` text
Linux app running → active
Linux app closed → inactive after threshold
```

------------------------------------------------------------------------

## Step 20. Implement Automatic Startup

Configure the Linux application to launch automatically with the user's
desktop session.

Test:

``` text
Computer boot/login
       ↓
Application starts
       ↓
Synchronizes
       ↓
Heartbeat begins
```

### Expected result

The reminder system does not require manually launching the application
every day.

------------------------------------------------------------------------

## Step 21. Implement Linux Application Settings / Status

Provide a minimal way to see:

-   connection status;
-   last successful synchronization;
-   server address;
-   desktop presence status;
-   optional version information.

Avoid building a second reminder-management UI unless it becomes
necessary.

The website remains the primary management interface.

### Expected result

Basic troubleshooting is possible without making the desktop client
unnecessarily complex.

------------------------------------------------------------------------

## Step 22. Linux Failure Scenarios

Test:

-   server unavailable;
-   temporary request failure;
-   application restart;
-   computer restart;
-   reminder edited while application is running;
-   reminder disabled while application is running;
-   reminder deleted while application is running;
-   multiple simultaneous reminders;
-   application closed;
-   application launched after a long period of inactivity.

The application should fail gracefully rather than crash.

------------------------------------------------------------------------

## Step 23. Linux End-to-End Test

Verify the complete workflow:

``` text
Website
  ↓
Create reminder
  ↓
Linux synchronizes
  ↓
Linux becomes active
  ↓
Reminder occurs
  ↓
Linux notification
  ↓
No iPhone notification
```

Then:

``` text
Close Linux app
  ↓
Heartbeat expires
  ↓
Server sees desktop inactive
  ↓
Next reminder occurs
  ↓
iPhone receives push
```

------------------------------------------------------------------------

## Phase 2 Completion Criteria

Phase 2 is complete when:

-   Linux application starts successfully;
-   it starts automatically with the system;
-   it synchronizes reminders;
-   it schedules reminders correctly;
-   it displays native notifications;
-   it groups simultaneous reminders;
-   it sends a heartbeat every 4 minutes;
-   server presence changes correctly after application shutdown;
-   website changes propagate to Linux;
-   the complete Desktop → Phone failover works.

At this point, the project has a working Linux client.

------------------------------------------------------------------------

# Phase 3 --- Working Windows Application

## Goal

The Windows application should provide the same functional behavior as
the Linux application while using Windows-native mechanisms where
appropriate.

The server does not need to be redesigned.

------------------------------------------------------------------------

## Step 24. Reuse the Desktop Client Architecture

The Windows application should use the same conceptual architecture as
Linux:

``` text
Server
  ↓
Sync
  ↓
Local Scheduler
  ↓
Desktop Notification

        +

Heartbeat
```

The goal is to share as much business logic as practical.

The platform-specific layer should primarily handle:

-   notifications;
-   startup;
-   application lifecycle;
-   OS-specific configuration.

### Expected result

The Windows client does not introduce a second, incompatible reminder
implementation.

------------------------------------------------------------------------

## Step 25. Implement Windows Server Connection

Implement the same server API integration:

-   device identification;
-   reminder synchronization;
-   heartbeat;
-   configuration;
-   error handling.

### Expected result

Windows can communicate with the existing backend without server-side
changes.

------------------------------------------------------------------------

## Step 26. Implement Windows Reminder Scheduler

Implement the same scheduling rules as the Linux application.

Verify:

-   Start anchoring;
-   inclusive End;
-   daily repetition;
-   disabled reminders;
-   multiple reminders;
-   simultaneous grouping;
-   synchronization after changes.

### Expected result

Windows calculates exactly the same reminder occurrences as the other
clients.

------------------------------------------------------------------------

## Step 27. Implement Windows Notifications

Integrate Windows native notifications.

The notification system should support the same logical content as
Linux.

Example:

``` text
🔔 Eye Exercise
Time to rest your eyes.
```

Multiple simultaneous reminders should remain grouped.

### Expected result

Windows delivers native desktop notifications.

------------------------------------------------------------------------

## Step 28. Implement Windows Heartbeat

Use the same:

``` text
4-minute heartbeat
10-minute inactivity threshold
```

The backend must treat Linux and Windows desktop clients consistently.

### Expected result

Windows presence controls phone notification suppression exactly like
Linux.

------------------------------------------------------------------------

## Step 29. Implement Windows Automatic Startup

Configure the application to start automatically with Windows.

Test:

``` text
Windows starts
   ↓
Application starts
   ↓
Synchronization
   ↓
Heartbeat
```

### Expected result

The application works without requiring manual launch.

------------------------------------------------------------------------

## Step 30. Windows Settings / Status

Provide the same minimal status information as Linux:

-   connection status;
-   last synchronization;
-   server information;
-   application version;
-   optional diagnostics/log access.

The UI should remain consistent across platforms where practical.

------------------------------------------------------------------------

## Step 31. Windows Failure Scenarios

Test:

-   application restart;
-   Windows restart;
-   server unavailable;
-   reminder edited from website;
-   reminder disabled;
-   reminder deleted;
-   simultaneous reminders;
-   application shutdown;
-   delayed startup;
-   repeated synchronization.

### Expected result

The Windows application behaves predictably under normal failures.

------------------------------------------------------------------------

## Step 32. Windows End-to-End Test

Verify:

``` text
Website
  ↓
Create reminder
  ↓
Windows synchronizes
  ↓
Windows becomes active
  ↓
Reminder occurs
  ↓
Windows notification
  ↓
No iPhone notification
```

Then:

``` text
Close Windows app
  ↓
Heartbeat expires
  ↓
Server sees desktop inactive
  ↓
Next reminder occurs
  ↓
iPhone receives push
```

------------------------------------------------------------------------

# Final Project Acceptance Test

After all three phases are complete, the entire system should pass the
following scenario.

## Scenario

Create:

``` text
Name:      Eye Exercise
Start:     09:00
End:       22:00
Interval:  20 minutes
Enabled:   Yes
```

### Case A --- Desktop active

``` text
Desktop application running
        ↓
Heartbeat every 4 minutes
        ↓
Server = Desktop active
        ↓
09:20 reminder
        ↓
Desktop notification
        ↓
No phone notification
```

### Case B --- Desktop closed

``` text
Desktop application closed
        ↓
Heartbeat stops
        ↓
10-minute threshold expires
        ↓
Server = Desktop inactive
        ↓
Next reminder
        ↓
iPhone Web Push
```

### Case C --- Multiple reminders

``` text
09:20
 ├── Eye Exercise
 └── Drink Water
```

Result:

``` text
One combined notification
```

### Case D --- Website modification

Change:

``` text
20 minutes
```

to:

``` text
30 minutes
```

Result:

``` text
Desktop synchronizes
        ↓
New schedule is used
```

### Case E --- Disable

Disable the reminder:

``` text
Enabled = No
```

Result:

``` text
No desktop notifications
No iPhone notifications
```

------------------------------------------------------------------------

# Phase Dependencies

The intended dependency chain is:

``` text
PHASE 1
Working Server
     │
     ├── Database
     ├── Reminder API
     ├── Scheduler
     ├── Web Push
     ├── Device Presence
     └── Notification Routing
              │
              ▼
PHASE 2
Working Linux App
     │
     ├── Sync
     ├── Local Scheduler
     ├── Linux Notifications
     ├── Heartbeat
     └── Autostart
              │
              ▼
PHASE 3
Working Windows App
     │
     ├── Sync
     ├── Local Scheduler
     ├── Windows Notifications
     ├── Heartbeat
     └── Autostart
```

The server is deliberately completed first because both desktop
applications depend on its API and presence model.

------------------------------------------------------------------------

# Development Philosophy

The project should be developed incrementally.

At every major step, the newly implemented functionality should be
testable independently.

Avoid implementing all three platforms simultaneously.

The preferred order is:

``` text
Server foundation
        ↓
Server notification system
        ↓
Linux client
        ↓
Linux end-to-end validation
        ↓
Windows client
        ↓
Windows end-to-end validation
```

The Linux application serves as the first complete desktop
implementation. Once its interaction with the server is proven, the
Windows application can reuse the established protocol and business
logic instead of introducing a second experimental architecture.

No additional product features should be added during these stages
unless they are necessary for reliability or correctness of the core
reminder system.
