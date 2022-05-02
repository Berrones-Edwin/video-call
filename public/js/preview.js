import { $ } from '../services/dom.js'


const constraints = {
  audio: true,
  video: {
    width: 500,
    height: 500
  }
}


const username = $('#username')
const join = $('#join')
const video = $('#video')
console.log(video)

username.textContent = `Welcome`
join.addEventListener('click', () => {
  window.location.href = './'
})

async function init() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = stream
  } catch (error) {}
}

init()
