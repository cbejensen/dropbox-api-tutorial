import { Dropbox } from 'dropbox'

const dbx = new Dropbox({
  accessToken:
    'aeOL1E1HS0AAAAAAAAAALX6z1ogWy75HGE_HBN-NNpJNfhnEa1kjF1vsJ_t7Wf8k',
  fetch
})

let files = []

const dbxManager = document.querySelector('.js-dbx')
const fileListElem = dbxManager.querySelector('.js-dbx--file-list')
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
  files = [...files, ...filtered]
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
  const sorted = files.sort((a, b) => (a < b ? 0 : 1))
  const dateFormat = { year: 'numeric', day: 'numeric', month: 'short' }
  const oldest = new Date(sorted[0].client_modified).toLocaleString(
    'en-us',
    dateFormat
  )
  const newest = new Date(
    sorted[sorted.length - 1].client_modified
  ).toLocaleString('en-us', dateFormat)
  dateRangeElem.innerHTML = `${oldest} - ${newest}`
}

init()
