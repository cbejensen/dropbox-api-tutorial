import { Dropbox } from 'dropbox'

const dbx = new Dropbox({
  accessToken:
    'aeOL1E1HS0AAAAAAAAAAGy2WjtZlAq0zP8WS1HYNvMmP__7ii2-2vMZ-8RXd9fJA',
  fetch
})

let files = []
let cursor = ''

const filesListElem = document.querySelector('.js-files')
const getFilesBtn = document.querySelector('.js-get-files')
getFilesBtn.addEventListener('click', e => getMoreFiles())

const getMoreFiles = () =>
  dbx
    .filesListFolderContinue({ cursor })
    .then(res => {
      updateFiles(res)
      renderFiles()
      if (!res.has_more) {
        getFilesBtn.classList.add('hidden')
      }
    })
    .catch(err => console.error(err))

const updateFiles = dbxRes => {
  files = [...files, ...dbxRes.entries]
  cursor = dbxRes.cursor
}

const renderFiles = () => {
  filesListElem.innerHTML = files.reduce((prevFiles, currentFile) => {
    return `${prevFiles}<li class="file">${currentFile.name}</li>`
  }, ``)
}

dbx
  .filesListFolder({
    path: '/Apps/Expense Organizer Demo',
    limit: 8
  })
  .then(res => {
    updateFiles(res)
    renderFiles()
    if (res.has_more) {
      getFilesBtn.classList.remove('hidden')
    }
  })
  .catch(err => console.error(err))
