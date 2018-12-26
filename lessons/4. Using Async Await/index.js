import { Dropbox } from 'dropbox'
import { async } from 'q'

const dbx = new Dropbox({
  accessToken:
    'aeOL1E1HS0AAAAAAAAAAGy2WjtZlAq0zP8WS1HYNvMmP__7ii2-2vMZ-8RXd9fJA',
  fetch
})

const init = async () => {
  try {
    const dbxRes = await dbx.filesListFolder({
      path: '/Apps/Expense Organizer Demo',
      limit: 8
    })
    updateFiles(dbxRes)
    renderFiles()
    if (dbxRes.has_more) {
      getFilesBtn.classList.remove('hidden')
    }
  } catch (err) {
    console.error(err)
  }
}

const getMoreFiles = async () => {
  try {
    const dbxRes = await dbx.filesListFolderContinue({ cursor })
    updateFiles(dbxRes)
    renderFiles()
    if (!dbxRes.has_more) {
      getFilesBtn.classList.add('hidden')
    }
  } catch (err) {
    console.error(err)
  }
}

const updateFiles = dbxRes => {
  files = [...files, ...dbxRes.entries]
  cursor = dbxRes.cursor
}

const renderFiles = () => {
  filesListElem.innerHTML = files.reduce((prevFiles, currentFile) => {
    return `${prevFiles}<li class="file">${currentFile.name}</li>`
  }, ``)
}

let files = []
let cursor = ''

const filesListElem = document.querySelector('.js-files')
const getFilesBtn = document.querySelector('.js-get-files')
getFilesBtn.addEventListener('click', getMoreFiles)

init()
