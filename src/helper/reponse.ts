export function sendResponse(
  message = "unable to process the request",
  success = false,
  status = 500,
  statusText = "error"
) {
  return Response.json(
    {
      success,
      message,
    },
    { status, statusText }
  );
}
