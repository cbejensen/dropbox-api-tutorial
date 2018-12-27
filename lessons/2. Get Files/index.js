// get files from Dropbox and log them in the console

import { Dropbox } from 'dropbox'

const dbx = new Dropbox({
  accessToken:
    'aeOL1E1HS0AAAAAAAAAALX6z1ogWy75HGE_HBN-NNpJNfhnEa1kjF1vsJ_t7Wf8k',
  fetch
})

dbx
  .filesListFolder({
    path: ''
  })
  .then(res => {
    console.log(res)
    console.table(res.entries)
  })
  .catch(err => console.error(err))
