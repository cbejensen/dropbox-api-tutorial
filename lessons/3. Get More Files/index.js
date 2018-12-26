import { Dropbox } from 'dropbox'

const dbx = new Dropbox({
  accessToken:
    'aeOL1E1HS0AAAAAAAAAAGy2WjtZlAq0zP8WS1HYNvMmP__7ii2-2vMZ-8RXd9fJA',
  fetch
})

const init = () => {
  dbx
    .filesListFolder({
      path: '/Apps/Expense Organizer Demo',
      limit: 8
    })
    .then(res => {
      updateFiles(res)
      renderFiles()
      dbxManager.classList.remove('hidden')
      if (res.has_more) {
        getFilesBtn.classList.remove('hidden')
      }
    })
    .catch(err => console.error(err))
}

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
  fileListElem.innerHTML = files.reduce((prevFiles, currentFile) => {
    return `${prevFiles}<li class="file">${currentFile.name}</li>`
  }, ``)
}

let files = []
let cursor = ''

const dbxManager = document.querySelector('.js-dbx')
const fileListElem = dbxManager.querySelector('.js-dbx--file-list')
const getFilesBtn = dbxManager.querySelector('.js-dbx--get-files-btn')

getFilesBtn.addEventListener('click', getMoreFiles)

init()
