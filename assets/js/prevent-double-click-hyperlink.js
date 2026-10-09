export const initPreventDoubleClickHyperlink = () => {
  Array.from(document.querySelectorAll('a')).forEach(link => {
    link.addEventListener('click', evt => {
      link.classList.add('disable-link')
      setTimeout(() => link.classList.remove('disable-link'), 1000)
    })
  })
}
