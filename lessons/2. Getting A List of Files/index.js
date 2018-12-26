import { Dropbox } from 'dropbox'

const dbx = new Dropbox({
  accessToken:
    'aeOL1E1HS0AAAAAAAAAAGy2WjtZlAq0zP8WS1HYNvMmP__7ii2-2vMZ-8RXd9fJA',
  fetch
})

dbx
  .filesListFolder({
    path: '/Apps/Expense Organizer Demo'
  })
  .then(res => {
    console.log(res)
    console.table(res.entries)
  })
  .catch(err => console.error(err))
