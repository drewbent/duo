if ($('#duo-tdp-container').length !== 0) {
  console.log('Duo: Hiding teacher dashboard popup.')
  const popup = $('#duo-tdp-container')
  popup.remove()
}