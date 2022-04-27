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
const disconectBtn = $('#disconect')
const videoNot = $('#videoNotAvailable')

// show placeholder video not available
if (videoFlag) videoNot.style.display = 'none'
else videoNot.style.display = 'table'

const user = JSON.parse(localStorage.getItem('user'))

username.textContent = `Welcome ${user.name}`
roomNameParagraph.querySelector('b').textContent = `${user.roomName}`

$('#audio').addEventListener('click', () => {
  audioFlag = !audioFlag
  settingsUser(audioFlag, videoFlag)
})
$('#video').addEventListener('click', () => {
  videoFlag = !videoFlag
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
  if (room.participants.length > 0) {
    room.participants.forEach(handleConectParticipants)
  }
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

  $('#alert-container').innerHTML = `<div class="alert alert-info" role="alert">
  The user ${user.name} is join to the call.
</div>`

  setTimeout(() => {
    $('#alert-container').remove()
  }, 2500)
}

const handleTrackPublication = (track, p) => {
  function displayTrack(track) {
    const pDiv = document.getElementById(p.identity)
    pDiv.append(track.attach())
    if (pDiv && pDiv.querySelector('video'))
      pDiv.querySelector('video').classList.add('container')
  }

  if (track.track) {
    displayTrack(track.track)
  }

  track.on('subscribed', displayTrack)
}
const handleDisconnectedParticipant = (p) => {
  p.removeAllListeners()
  const pDiv = document.getElementById(p.identity)
  pDiv.remove()
}

disconectBtn.addEventListener('click', () => {
  handleDisconnectedParticipant(room.localParticipant)
  room.disconnect()
  deleteSettingsUser()
})

function deleteSettingsUser() {
  localStorage.removeItem('user')
  localStorage.removeItem('settings')
  window.location.href = '/'
}

startRoom()
turnOnOffAudio(audioFlag)
turnOnOffVideo(videoFlag)
