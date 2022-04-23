const $ = (selector) => document.querySelector(selector)

const form = $('#roomNameForm')
const roomNameInput = $('#roomName')
const videoContainer = $('#videoContainer')

const startRoom = async (evt) => {
  evt.preventDefault()

  form.style.visibility = 'hidden'

  const roomName = roomNameInput.value

  const response = await fetch('/join-room', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ roomName })
  })

  const { token } = await response.json()

  const room = await joinVideo(roomName,token)
  console.log(room)

}

const joinVideo = async (room, token) => {
  return await Twilio.Video.connect(token, {
    room
  })
}

form.addEventListener('submit', startRoom)
