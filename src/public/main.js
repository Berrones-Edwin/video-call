import { $ } from './services/dom.js'

const form = $('#roomNameForm')

form.addEventListener('submit', (evt) => {
  evt.preventDefault()
  const data = new FormData(form)
  let name = data.get('name')
  let roomName = data.get('roomName')

  let video = !$('#video').checked

  localStorage.setItem(
    'user',
    JSON.stringify({
      name,
      roomName
    })
  )
  localStorage.setItem('settings', JSON.stringify({ audio: true, video }))

  window.location.href = './video-call'
})
