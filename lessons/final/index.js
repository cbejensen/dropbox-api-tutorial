import { Dropbox } from 'dropbox'

const dbx = new Dropbox({
  accessToken:
    'aeOL1E1HS0AAAAAAAAAALX6z1ogWy75HGE_HBN-NNpJNfhnEa1kjF1vsJ_t7Wf8k',
  fetch
})

const state = {
  rootPath: '',
  files: []
}

const rootPathForm = document.querySelector('.js-root-path__form')
const rootPathInput = document.querySelector('.js-root-path__input')
const loadingElem = document.querySelector('.js-loading')
const mainElem = document.querySelector('main')
const organizeBtn = mainElem.querySelector('.js-organize-btn')
const fileListElem = mainElem.querySelector('.js-file-list')
const dateRangeElem = mainElem.querySelector('.js-date-range')
const logElem = mainElem.querySelector('.js-log')

rootPathForm.addEventListener('submit', e => {
  e.preventDefault()
  // if user enters a slash to try and use the root of the folder
  // we need to use an empty string
  state.rootPath =
    rootPathInput.value === '/' ? '' : rootPathInput.value.toLowerCase()
  state.files = []
  loadingElem.classList.remove('hidden')
  logElem.classList.add('hidden')
  reset()
})

organizeBtn.addEventListener('click', async e => {
  // if no files, exit
  if (!state.files.filter(item => item.client_modified).length) {
    alert(
      'This app can only organize files. Please enter a path with some files'
    )
    return
  }
  try {
    const originalMsg = e.target.innerHTML
    e.target.disabled = true
    e.target.innerHTML = 'Working...'
    // it doesn't seem like you need to create folders
    // before moving files... hmmmm...
    // const createFoldersRes = await createFoldersFromDates();
    // console.log(createFoldersRes);
    const moveFilesRes = await moveFilesToDatedFolders()
    logElem.classList.remove('hidden')
    logResults(moveFilesRes.entries)
    e.target.disabled = false
    e.target.innerHTML = originalMsg
    reset()
  } catch (err) {
    console.error(err)
  }
})

const init = () => {
  dbx
    .filesListFolder({
      path: state.rootPath.toLowerCase(),
      limit: 20
    })
    .then(async res => {
      updateFiles(res.entries)
      loadingElem.classList.add('hidden')
      mainElem.classList.remove('hidden')
      dateRangeElem.classList.remove('hidden')
      // state.cursor = res.cursor
      if (res.has_more) {
        loadingElem.classList.remove('hidden')
        await getRestOfFiles(res.cursor, more => updateFiles(more.entries))
        loadingElem.classList.add('hidden')
      }
    })
    .catch(err => {
      const msg =
        typeof err.error === 'object' ? err.error.error_summary : err.error
      if (msg === 'path/not_found') {
        alert("That path doesn't seem to exist. Please try again.")
      } else {
        alert(`Error: ${msg}`)
      }
    })
}

const reset = () => {
  state.files = []
  loadingElem.classList.remove('hidden')
  init()
}

const getRestOfFiles = async (cursor, cb) => {
  // state.cursor = cursor
  try {
    const res = await dbx.filesListFolderContinue({ cursor })
    if (cb) cb(res)
    if (res.has_more) {
      return [...res.entries, ...(await getRestOfFiles(res.cursor, cb))]
    }
    return res.entries || []
  } catch (err) {
    throw new Error(err.error)
  }
}

const updateFiles = files => {
  state.files = [...state.files, ...files]
  renderFiles()
  getThumbnails(files)
  renderDateRange()
}

const renderFiles = () => {
  fileListElem.innerHTML = state.files
    .sort((a, b) => {
      // folders should come first
      // if one is folder and the other is not, prioritize folder
      // but if both are folders, sort by name
      if (
        (a['.tag'] === 'folder' || b['.tag'] === 'folder') &&
        !(a['.tag'] !== b['.tag'])
      ) {
        return -1
      } else {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
      }
    })
    .map(file => {
      const type = file['.tag']
      let thumbnail
      if (type === 'file') {
        thumbnail = file.thumbnail
          ? `data:image/jpeg;base64, ${file.thumbnail}`
          : // default file icon
            `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUiPjxwYXRoIGQ9Ik0xMyAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWOXoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIxMyAyIDEzIDkgMjAgOSI+PC9wb2x5bGluZT48L3N2Zz4=`
      } else {
        // default folder icon
        thumbnail = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZvbGRlciI+PHBhdGggZD0iTTIyIDE5YTIgMiAwIDAgMS0yIDJINGEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmg1bDIgM2g5YTIgMiAwIDAgMSAyIDJ6Ij48L3BhdGg+PC9zdmc+`
      }
      return `
      <li class="dbx-list-item ${type}">
        <img class="dbx-thumb" src="${thumbnail}">
        ${file.name}
      </li>
    `
    })
    .join('')
}

const getThumbnails = async files => {
  // folders don't have thumbnails, so remove them
  const paths = files
    .filter(file => file['.tag'] === 'file')
    .map(file => ({
      path: file.path_lower,
      size: 'w32h32'
    }))
  try {
    const res = await dbx.filesGetThumbnailBatch({
      entries: paths
    })
    // make a copy of state.files
    const newStateFiles = [...state.files]
    const errors = []
    // for every file from filesGetThumbnailBatch,
    // find match in state.files and add thumbnail prop
    res.entries.forEach(file => {
      if (file['.tag'] === 'failure') {
        errors.push(file)
      } else {
        let indexToUpdate = state.files.findIndex(
          stateFile => file.metadata.path_lower === stateFile.path_lower
        )
        newStateFiles[indexToUpdate].thumbnail = file.thumbnail
      }
    })
    state.files = newStateFiles
    renderFiles()
    if (errors.length) throw new Error({ errors })
  } catch (err) {
    throw new Error(err.error)
  }
}

const renderDateRange = () => {
  const sorted = state.files
    // ignore folders as they don't have modified dates
    .filter(item => item.client_modified)
    .sort((a, b) => (a.client_modified < b.client_modified ? -1 : 1))
  // no files, no date range
  if (!sorted.length) {
    dateRangeElem.parentElement.classList.add('hidden')
    return
  }
  const oldest = formatDbxDate(sorted[0].client_modified)
  const newest = formatDbxDate(sorted[sorted.length - 1].client_modified)
  dateRangeElem.innerHTML = `${oldest} - ${newest}`
}

const formatDbxDate = dbxDate => {
  return new Date(dbxDate).toLocaleString('en-us', {
    year: 'numeric',
    month: 'short'
  })
}

const createFoldersFromDates = async () => {
  console.group('Creating Folders')
  try {
    const paths = state.files
      // filter out folders, as they don't have .client_modified
      .filter(file => file.client_modified)
      // get an array of folder paths that need to be created
      .reduce((arr, file) => {
        const date = new Date(file.client_modified)
        const path = `${state.rootPath.toLowerCase()}/${date.getUTCFullYear()}/${date.getUTCMonth() +
          1}`
        // make sure array doesn't have this date yet
        if (arr.indexOf(path) === -1) arr.push(path)
        return arr
      }, [])
    if (!paths.length) {
      throw new Error('There are no files that can be organized')
    }
    let res = await dbx.filesCreateFolderBatch({ paths })
    // res may complete right away and have an entries prop on it
    // or it may return async_job_id to show it's still working
    console.log(res)
    const { async_job_id } = res
    if (async_job_id) {
      // keep calling until we get entries prop
      do {
        res = await dbx.filesCreateFolderBatchCheck({
          async_job_id
        })
        console.log(res)
      } while (res['.tag'] === 'in_progress')
    }
    console.groupEnd()
    return res
  } catch (err) {
    throw new Error(err.error)
  }
}

const moveFilesToDatedFolders = async () => {
  console.group('Moving Files')
  try {
    const entries = state.files
      // only move files, not folders
      .filter(item => item['.tag'] === 'file')
      // set up from and to paths as needed by dbx api
      .map(file => {
        const date = new Date(file.client_modified)
        return {
          from_path: file.path_lower,
          to_path: `${state.rootPath.toLowerCase()}/${date.getUTCFullYear()}/${date.getUTCMonth() +
            1}/${file.name}`
        }
      })
    // make the file moving request
    let res = await dbx.filesMoveBatchV2({ entries })
    // res may complete right away and have an entries prop on it
    // or it may return async_job_id to show it's still working
    console.log(res)
    const { async_job_id } = res
    if (async_job_id) {
      // keep calling until we get entries prop
      do {
        res = await dbx.filesMoveBatchCheckV2({
          async_job_id
        })
        console.log(res)
      } while (res['.tag'] === 'in_progress')
    }
    console.groupEnd()
    return res
  } catch (err) {
    throw new Error(err.error)
  }
}

const logResults = entries => {
  const filesOnly = state.files.filter(item => item['.tag'] === 'file')
  logElem.innerHTML = entries
    .map((entry, i) => {
      const status = entry['.tag']
      // use name from dbx response if possible
      // otherwise map it from state.files and hope it's the same
      const fileName =
        (entry.success && entry.success.name) || filesOnly[i].name
      let msg
      if (status === 'success') {
        msg = entry.success.path_display
      } else if (status === 'failure') {
        msg = entry.failure['.tag']
      } else {
        // entry['.tag'] should be other
        msg = entry.failure ? entry.failure['.tag'] : null
      }
      return `<li class="log-item log-item--${status}">${fileName} - ${status} - ${msg}</li>`
    })
    .join('')
}

init()
