function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)

  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let index = 0; index < rawData.length; index++) {
    outputArray[index] = rawData.charCodeAt(index)
  }

  return outputArray
}

export async function registerPush() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker is not supported')
  }

  if (!('PushManager' in window)) {
    throw new Error('Web Push is not supported')
  }

  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported')
  }

  const permission = await Notification.requestPermission()

  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted')
  }

  const keyResponse = await fetch('/api/push/vapid-public-key')

  if (!keyResponse.ok) {
    throw new Error('Failed to get VAPID public key')
  }

  const { publicKey } = await keyResponse.json()

  const registration = await navigator.serviceWorker.register('/sw.js')

  const existingSubscription =
    await registration.pushManager.getSubscription()

  const subscription =
    existingSubscription ??
    await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })

  const subscribeResponse = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'iphone',
      subscription: subscription.toJSON(),
    }),
  })

  if (!subscribeResponse.ok) {
    throw new Error('Failed to register push subscription')
  }

  return subscription
}

export async function getPushStatus() {
  if (!('serviceWorker' in navigator)) {
    return {
      supported: false,
      subscribed: false,
    }
  }

  const registration = await navigator.serviceWorker.getRegistration(
    '/sw.js'
  )

  if (!registration) {
    return {
      supported: true,
      subscribed: false,
    }
  }

  const subscription =
    await registration.pushManager.getSubscription()

  return {
    supported: true,
    subscribed: Boolean(subscription),
  }
}