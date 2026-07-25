// Dialogflow webhook adapter — parses requests and builds fulfillment responses.

function detect(body) {
  return !!(body && body.queryResult);
}

function parseRequest(body) {
  const intent = body.queryResult?.intent?.displayName || 'Welcome';
  const parameters = body.queryResult?.parameters || {};
  const queryText = body.queryResult?.queryText || '';
  const session = body.session || '';

  return {
    intent,
    parameters,
    queryText,
    session,
  };
}

function buildResponse(text) {
  return {
    fulfillmentText: text,
    fulfillmentMessages: [
      {
        text: {
          text: [text],
        },
      },
    ],
  };
}

function buildErrorResponse(text) {
  return {
    fulfillmentText: text || "Sorry, I couldn't process that request. Please try again.",
    fulfillmentMessages: [
      {
        text: {
          text: [text || "Sorry, I couldn't process that request. Please try again."],
        },
      },
    ],
  };
}

module.exports = { detect, parseRequest, buildResponse, buildErrorResponse };
