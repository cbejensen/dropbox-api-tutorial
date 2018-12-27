// create folders based on modification dates of files
// http://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesCreateFolderV2__anchor

import { Dropbox } from 'dropbox'

const dbx = new Dropbox({
  accessToken:
    'aeOL1E1HS0AAAAAAAAAALX6z1ogWy75HGE_HBN-NNpJNfhnEa1kjF1vsJ_t7Wf8k',
  fetch
})

let files = []

const dbxManager = document.querySelector('.js-dbx')
const fileListElem = dbxManager.querySelector('.js-dbx--file-list')
const createFoldersBtn = dbxManager.querySelector('.js-dbx--create-folders-btn')
const dateRangeElem = dbxManager.querySelector('.js-dbx--date-range span')

const init = async () => {
  try {
    const res = await dbx.filesListFolder({
      path: ''
    })
    updateFiles(res.entries)
    dbxManager.classList.remove('hidden')
    if (res.has_more) {
      const files = await getRestOfFiles(res.cursor)
      console.log(files)
    }
    createFoldersBtn.addEventListener('click', createFoldersFromDates)
  } catch (err) {
    console.error(err)
  }
}

const getRestOfFiles = async cursor => {
  try {
    const res = await dbx.filesListFolderContinue({ cursor })
    updateFiles(res.entries)
    if (res.has_more) {
      getRestOfFiles(res.cursor)
    }
  } catch (err) {
    console.error(err)
  }
}

const updateFiles = newFiles => {
  // only show files, not folders
  const filtered = newFiles.filter(file => file['.tag'] === 'file')
  files = [...files, ...newFiles]
  renderFiles()
  renderDateRange()
}

const renderFiles = () => {
  fileListElem.innerHTML = files.reduce((prevFiles, currentFile) => {
    return `${prevFiles}<li class="dbx-list-item ${currentFile['.tag']}">${
      currentFile.name
    }</li>`
  }, ``)
}

const renderDateRange = () => {
  // folders don't have modified dates, so remove folders
  // if they exist
  const sortedFiles = files
    .filter(item => item.client_modified)
    .sort((a, b) => {
      // sort from oldest to newest
      return a < b ? 0 : 1
    })
  const oldest = formatDbxDate(sortedFiles[0].client_modified)
  const newest = formatDbxDate(
    sortedFiles[sortedFiles.length - 1].client_modified
  )
  dateRangeElem.innerHTML = `${oldest} - ${newest}`
}

const formatDbxDate = dbxDate => {
  return new Date(dbxDate).toLocaleString('en-us', {
    year: 'numeric',
    day: 'numeric',
    month: 'short'
  })
}

const createFoldersFromDates = () => {
  const datePaths = []
  files.forEach(file => {
    if (!file.client_modified) return
    const date = new Date(file.client_modified)
    const path = `/${date.getUTCFullYear()}/${date.getUTCMonth() + 1}`
    if (datePaths.indexOf(path) === -1) datePaths.push(path)
  })
  datePaths.forEach(async path => {
    try {
      const metadata = await dbx.filesCreateFolderV2({ path })
      console.log(metadata)
    } catch (err) {
      console.log(err)
    }
  })
}

init()
