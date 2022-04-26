// @ts-check
import { response } from './services/getToken.js'
import { $ } from './services/dom.js'
import { settingsUser } from './services/settingsUser.js'

if (!localStorage.getItem('user') || !localStorage.getItem('settings')) {
  window.location.href = '/'
}

const settings = JSON.parse(localStorage.getItem('settings'))

let audioFlag = settings.audio
let videoFlag = settings.video
$('#audio').textContent =`${ audioFlag ? 'Audio On' : 'Audio Off' }`
$('#video').textContent =`${ videoFlag ? 'Video On' : 'Video Off' }`

const username = $('#username')

const roomNameParagraph = $('#room')
const videoContainer = $('#videoContainer')
const disconectBtn = $('#disconect')

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
  disconectBtn.style.visibility = 'initial'

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
  pDiv.remove()
}

disconectBtn.addEventListener('click', () => {
  handleDisconnectedParticipant(room.localParticipant)
  room.disconnect()
  localStorage.removeItem('user')
  localStorage.removeItem('settings')
  window.location.href = '/'
})

startRoom()
