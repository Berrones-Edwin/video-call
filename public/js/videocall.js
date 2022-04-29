// @ts-check
import { response } from '../services/getToken.js'
import { $ } from '../services/dom.js'
import {
  settingsUser,
  turnOnOffAudio,
  turnOnOffVideo
} from '../services/settingsUser.js'

if (!localStorage.getItem('user') || !localStorage.getItem('settings')) {
  window.location.href = '/'
}

const settings = JSON.parse(localStorage.getItem('settings'))

let audioFlag = settings.audio
let videoFlag = settings.video

const username = $('#username')
const roomNameParagraph = $('#room')
const videoContainer = $('#videoContainer')
const videoNot = $('#videoNotAvailable')
const btnInvite = $('#invite')
const alertContainer = $('#alert')
const leaveSession = $('#leaveSession #Understood')

// show placeholder video not available
if (videoFlag) videoNot.style.display = 'none'
else videoNot.style.display = 'block'

const user = JSON.parse(localStorage.getItem('user'))

username.textContent = `Welcome ${user.name}`
roomNameParagraph.textContent = `Room Name: ${user.roomName}`

$('#audio').addEventListener('click', () => {
  audioFlag = !audioFlag
  settingsUser(audioFlag, videoFlag)
})
$('#video').addEventListener('click', () => {
  videoFlag = !videoFlag
  if (videoContainer.hasChildNodes()) {
    videoContainer.removeChild(videoContainer.firstElementChild)
  }
  settingsUser(audioFlag, videoFlag)
})

let room = null

const startRoom = async () => {
  const roomName = user.roomName
  const { token } = await response(roomName)

  // join room using token
  room = await joinVideo(roomName, token)

  // render local and remote participants' video and audio
  handleConectParticipants(room.localParticipant)

  room.participants.forEach(handleConectParticipants)

  room.on('participantConnected', handleConectParticipants)

  room.on('participantDisconnected', handleDisconnectedParticipant)
  window.addEventListener('pagehide', () => room.disconnect())
  window.addEventListener('beforeunload', () => room.disconnect())
}

const joinVideo = async (room, token) => {
  // @ts-ignore
  return await Twilio.Video.connect(token, {
    room,
    video: videoFlag,
    audio: audioFlag
  })
}

const handleConectParticipants = (p) => {
  const div = document.createElement('div')
  div.setAttribute('id', p.identity)

  videoContainer.appendChild(div)

  p.tracks.forEach((track) => {
    handleTrackPublication(track, p)
  })

  p.on('trackPublished', handleTrackPublication)
}

const handleTrackPublication = (track, p) => {
  function displayTrack(track) {
    const pDiv = document.getElementById(p.identity)
    pDiv.append(track.attach())
  }

  if (track.track) {
    displayTrack(track.track)
  }

  track.on('subscribed', displayTrack)
}
const handleDisconnectedParticipant = (p) => {
  p.removeAllListeners()
  const pDiv = document.getElementById(p.identity)
  if (pDiv) {
    pDiv.remove()
  }
}

function deleteSettingsUser() {
  localStorage.removeItem('user')
  localStorage.removeItem('settings')
  window.location.href = '/'
}

leaveSession.addEventListener('click', () => {
  handleDisconnectedParticipant(room.localParticipant)
  room.disconnect()
  deleteSettingsUser()
})

btnInvite.addEventListener('click', () => {
  navigator.clipboard
    .writeText(user.roomName)
    .then(() => {
      console.log('here')
      alertContainer.innerHTML  = `<div class="alert alert-primary" role="alert">
    The room name was copied! Send the code to others users.
  </div>`
    })
    .catch(() => {
      alertContainer.innerHTML  = `<div class="alert alert-dagner" role="alert">
    The room name was not copied! Try it again.
  </div>`
    })
    setTimeout(()=>{
      if(alertContainer) alertContainer.removeChild()
    },1500)
})

startRoom()
turnOnOffAudio(audioFlag)
turnOnOffVideo(videoFlag)
