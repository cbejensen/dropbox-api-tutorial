import { Dropbox } from 'dropbox'

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
    dbxManager.classList.remove('hidden')
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
  // only show files, not folders
  const dbxResFiles = dbxRes.entries.filter(file => file['.tag'] === 'file')
  files = [...files, ...dbxResFiles]
  cursor = dbxRes.cursor
}

const renderFiles = () => {
  fileListElem.innerHTML = files.reduce((prevFiles, currentFile) => {
    return `${prevFiles}<li class="dbx-list-item ${currentFile['.tag']}">${
      currentFile.name
    }</li>`
  }, ``)
}

let files = []
let cursor = ''

const dbxManager = document.querySelector('.js-dbx')
const fileListElem = dbxManager.querySelector('.js-dbx--file-list')
const getFilesBtn = dbxManager.querySelector('.js-dbx--get-files-btn')

getFilesBtn.addEventListener('click', getMoreFiles)

init()
