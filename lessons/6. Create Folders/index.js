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
const dateRangeElem = dbxManager.querySelector('.js-dbx--date-range')

const init = async () => {
  try {
    const res = await dbx.filesListFolder({
      path: '',
      limit: 8
    })
    updateFiles(res.entries)
    dbxManager.classList.remove('hidden')
    if (res.has_more) {
      await getRestOfFiles(res.cursor)
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
      await getRestOfFiles(res.cursor)
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
  let fileList = ''
  // if no files, show msg
  if (!files.length) {
    fileList = 'No files'
  } else {
    fileList = files.reduce((prevFiles, currentFile) => {
      return `${prevFiles}<li class="dbx-list-item ${currentFile['.tag']}">${
        currentFile.name
      }</li>`
    }, ``)
  }
  fileListElem.innerHTML = fileList
}

const renderDateRange = () => {
  // folders don't have modified dates, so remove folders
  // if they exist
  const sortedFiles = files
    .filter(item => (item ? item.client_modified : false))
    .sort((a, b) => {
      // sort from oldest to newest
      return a < b ? 0 : 1
    })
  // if there are no files, exit
  if (!sortedFiles.length) return
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

const fakeDates = [
  '/2015/01',
  '/2015/02',
  '/2015/06',
  '/2015/03',
  '/2015/04',
  '/2015/05',
  '/2015/07',
  '/2015/08',
  '/2015/09',
  '/2015/10',
  '/2015/11',
  '/2015/12',
  '/2016/01',
  '/2016/02',
  '/2016/06',
  '/2016/03',
  '/2016/04',
  '/2016/05',
  '/2016/07',
  '/2016/08',
  '/2016/09',
  '/2016/10',
  '/2016/11',
  '/2016/12',
  '/2017/01',
  '/2017/02',
  '/2017/06',
  '/2017/03',
  '/2017/04',
  '/2017/05',
  '/2017/07',
  '/2017/08',
  '/2017/09',
  '/2017/10',
  '/2017/11',
  '/2017/12'
]

const createFoldersFromDates = async () => {
  try {
    const paths = files
      // filter out folders, as they don't have .client_modified
      .filter(file => file.client_modified)
      // get an array of folder paths that need to be created
      .reduce((arr, file) => {
        const date = new Date(file.client_modified)
        const path = `/${date.getUTCFullYear()}/${date.getUTCMonth() + 1}`
        // make sure array doesn't have this date yet
        if (arr.indexOf(path) === -1) arr.push(path)
        return arr
      }, [])
    if (!paths.length)
      throw new Error('There are no files that can be organized')
    paths.push(...fakeDates) // remove in real app
    let res = await dbx.filesCreateFolderBatch({ paths })
    // res may complete right away and have an entries prop on it
    // or it may return async_job_id to show it's still working
    const { async_job_id } = res
    if (async_job_id) {
      // keep calling until we get entries
      do {
        console.log(res)
        res = await dbx.filesCreateFolderBatchCheck({
          async_job_id
        })
      } while (res['.tag'] === 'in_progress')
    }
    console.log(res.entries)
  } catch (err) {
    console.error('Something went wrong:', err)
  }
}

/* 
 another way to create multiple folders using dbx.filesCreateFolderV2 instead
*/
// const createFoldersFromDates = () => {
// const datePaths = []
// files.forEach(file => {
//   if (!file.client_modified) return
//   const date = new Date(file.client_modified)
//   const path = `/${date.getUTCFullYear()}/${date.getUTCMonth() + 1}`
//   if (datePaths.indexOf(path) === -1) datePaths.push(path)
// })
// console.log(datePaths)
// // wait for every folder to be created and return
// // an array of each result
// const results = await Promise.all(
//   datePaths.map(path =>
//     // we catch the error on each individual promise
//     // to avoid Promise.all's fail-fast behavior.
//     // This allows us to see which folders were actually
//     // created and which had an issue
//     // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
//     dbx
//       .filesCreateFolderV2({ path })
//       .catch(err => ({ path_display: path, ...err }))
//   )
// )
// console.log(results)
// }

init()
