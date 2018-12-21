import { Dropbox } from 'dropbox'

const dbx = new Dropbox({
  accessToken:
    'aeOL1E1HS0AAAAAAAAAAGy2WjtZlAq0zP8WS1HYNvMmP__7ii2-2vMZ-8RXd9fJA',
  fetch
})

let state = {
  file: [],
  has_more: false,
  cursor: ''
}

const filesElem = document.querySelector('.js-files')
const getFilesBtn = document.querySelector('.js-get-files')
getFilesBtn.addEventListener('click', e => renderMoreFiles())

const renderFiles = () => {
  filesElem.innerHTML = state.files.reduce(
    (prevFiles, currentFile) => `${prevFiles}<li>${currentFile.name}</li>`,
    ``
  )
}

const renderMoreFiles = () => {
  if (!state.has_more) {
    return console.error('Tried to render more files when has_more is false.')
  }
  getMoreFiles()
    .then(() => {
      renderFiles()
      if (!state.has_more) {
        getFilesBtn.classList.add('hidden')
      }
    })
    .catch(err => console.error(err))
}

const getMoreFiles = () => {
  return dbx
    .filesListFolderContinue({ cursor: state.cursor })
    .then(res => {
      state = {
        ...state,
        files: [...state.files, ...res.entries],
        has_more: res.has_more,
        cursor: res.cursor
      }
      return state
    })
    .catch(err => err)
}

dbx
  .filesListFolder({
    path: '/Apps/Expense Organizer Demo',
    limit: 6
  })
  .then(res => {
    state = {
      ...state,
      files: res.entries,
      has_more: res.has_more,
      cursor: res.cursor
    }
    renderFiles()
  })
  .catch(err => console.error(err))
