export const initHmppsSortSelector = () => {
  const $button = document.querySelector('.hmpps-sort-selector__sort-button')
  if ($button) {
    $button.classList.add('govuk-!-display-none')

    Array.from(document.getElementsByClassName('hmpps-sort-selector__select')).forEach(s => {
      s.addEventListener('change', () => {
        s.form.submit()
      })
    })
  }
}
