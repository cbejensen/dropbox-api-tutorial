// import the Dropbox JavaScript SDK and initialize
// using the Dropbox class

import { Dropbox } from 'dropbox'
// note that Dropbox has to be a named import
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Import_a_single_export_from_a_module

const dbx = new Dropbox({
  accessToken:
    'aeOL1E1HS0AAAAAAAAAALX6z1ogWy75HGE_HBN-NNpJNfhnEa1kjF1vsJ_t7Wf8k',
  fetch // could be another fetch library
})

console.log(dbx)
