require('dotenv').config()
const { v4: uuidv4 } = require('uuid')
const AccessToken = require('twilio').jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant
const express = require('express')
const app = express()
const port = 3000

app.use(express.json())
app.use(express.static(__dirname + "/public/"));
app.use(express.static(__dirname + "/public/services/"));
app.use(express.static(__dirname + "/public/img/"));

// Create the twilioClient
const twilioClient = require('twilio')(
  process.env.TWILIO_API_KEY_SID,
  process.env.TWILIO_API_KEY_SECRET,
  {
    accountSid: process.env.TWILIO_ACCOUNT_SID
  }
)

const findOrCreateRoom = async (roomName) => {
  try {
    await twilioClient.video.rooms(roomName).fetch()
  } catch (error) {
    if (error.code === 20404) {
      await twilioClient.video.rooms.create({
        uniqueName: roomName,
        type: 'go'
      })
    } else throw error
  }
}

const getAccessToken = (roomName) => {
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_KEY_SECRET,
    {
      identity: uuidv4()
    }
  )

  const videoGrant = new VideoGrant({
    room: roomName
  })

  token.addGrant(videoGrant)

  return token.toJwt()
}

app.get('/', (req, res) => {
   res.sendFile(__dirname + "/public/index.html")
})
app.get('/video-call', (req, res) => {
   res.sendFile(__dirname + "/public/videocall.html")
})

app.post('/join-room', async (req, res) => {
  if (!req.body || !req.body.roomName) {
    return res.status(400).send('Must include roomName argument')
  }

  const roomName = req.body.roomName

  findOrCreateRoom(roomName)

  const token = getAccessToken(roomName)

  res.send({
    token
  })
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
