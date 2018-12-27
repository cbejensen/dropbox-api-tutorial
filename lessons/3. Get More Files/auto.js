// automatically get all files

import { Dropbox } from 'dropbox'

const dbx = new Dropbox({
  accessToken:
    'aeOL1E1HS0AAAAAAAAAALX6z1ogWy75HGE_HBN-NNpJNfhnEa1kjF1vsJ_t7Wf8k',
  fetch
})

let files = []

const dbxManager = document.querySelector('.js-dbx')
const fileListElem = dbxManager.querySelector('.js-dbx--file-list')

const init = () => {
  dbx
    .filesListFolder({
      path: '',
      limit: 8 // remove this once we verify getting all files works
    })
    .then(res => {
      updateFiles(res.entries)
      if (res.has_more) {
        getRestOfFiles(res.cursor).then(() => {
          dbxManager.classList.remove('hidden')
        })
      }
    })
    .catch(err => console.error(err))
}

const getRestOfFiles = cursor => {
  return dbx
    .filesListFolderContinue({ cursor })
    .then(res => {
      updateFiles(res.entries)
      if (res.has_more) {
        return getRestOfFiles(res.cursor).then(files => files)
      } else {
        return res.entries
      }
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
