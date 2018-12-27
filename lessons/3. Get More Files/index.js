// limit the query to a set number of files,
// then allow the user to get more files

// to get all files right away, load auto.js instead

import { Dropbox } from 'dropbox'

const dbx = new Dropbox({
  accessToken:
    'aeOL1E1HS0AAAAAAAAAALX6z1ogWy75HGE_HBN-NNpJNfhnEa1kjF1vsJ_t7Wf8k',
  fetch
})

let files = []

const dbxManager = document.querySelector('.js-dbx')
const fileListElem = dbxManager.querySelector('.js-dbx--file-list')
const getFilesBtn = dbxManager.querySelector('.js-dbx--get-files-btn')

const init = () => {
  dbx
    .filesListFolder({
      path: '',
      limit: 8
    })
    .then(res => {
      updateFiles(res.entries)
      dbxManager.classList.remove('hidden')
      if (res.has_more) {
        const getMoreFiles = makeFileGetter(res.cursor)
        getFilesBtn.addEventListener('click', getMoreFiles)
        getFilesBtn.classList.remove('hidden')
      }
    })
    .catch(err => console.error(err))
}

const makeFileGetter = initCursor => {
  let cursor = initCursor
  return () =>
    dbx
      .filesListFolderContinue({ cursor })
      .then(res => {
        updateFiles(res.entries)
        if (!res.has_more) {
          getFilesBtn.classList.add('hidden')
        }
        cursor = res.cursor
        return res
      })
      .catch(err => console.error(err))
}

const updateFiles = newFiles => {
  // only show files, not folders
  const filtered = newFiles.filter(file => file['.tag'] === 'file')
  files = [...files, ...filtered]
  renderFiles()
}

const renderFiles = () => {
  fileListElem.innerHTML = files.reduce((prevFiles, currentFile) => {
    return `${prevFiles}<li class="dbx-list-item ${currentFile['.tag']}">${
      currentFile.name
    }</li>`
  }, ``)
}

init()
