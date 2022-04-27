// export const response =

export async function response(roomName) {

  let response = await fetch('/join-room', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ roomName })
  })

  let responseJson = response.json()
  return responseJson
}
