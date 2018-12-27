// import the Dropbox JavaScript SDK and initialize
// using the Dropbox class

import { Dropbox } from 'dropbox'
// note that Dropbox has to be a named import
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Import_a_single_export_from_a_module

const dbx = new Dropbox({
  accessToken:
    'aeOL1E1HS0AAAAAAAAAAGy2WjtZlAq0zP8WS1HYNvMmP__7ii2-2vMZ-8RXd9fJA',
  fetch // could be another fetch library
})

console.log(dbx)
