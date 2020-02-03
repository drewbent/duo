function sendErrorResponse(sendResponse) {
  return (error) => sendResponse({ error: error.message, status: error.name })
}