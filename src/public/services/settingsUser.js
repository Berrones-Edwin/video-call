export function settingsUser(audio, video) {
  localStorage.setItem(
    'settings',
    JSON.stringify({ audio, video })
  )

  window.location.reload()
}
