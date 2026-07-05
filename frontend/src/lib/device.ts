export const getDeviceId = (): string => {
  let id = localStorage.getItem('deviceId')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('deviceId', id)
  }
  return id
}

export const getDeviceName = (): string => {
  const ua = navigator.userAgent
  if (/mobile/i.test(ua)) return 'Mobile Browser'
  if (/tablet/i.test(ua)) return 'Tablet Browser'
  return 'Desktop Browser'
}
