export function sendResponse(
  message = "unable to process the request",
  success = false,
  status = 500,
  statusText = "error",
  data: any = ""
) {
  return Response.json(
    {
      success,
      message,
      data,
    },
    { status, statusText }
  );
}
