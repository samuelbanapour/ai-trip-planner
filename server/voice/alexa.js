// Alexa Skill Kit adapter — parses requests and builds SSML responses.

function detect(body) {
  return !!(body && body.version && body.request);
}

function parseRequest(body) {
  const requestType = body.request?.type || '';
  const intentName = body.request?.intent?.name || '';
  const slots = body.request?.intent?.slots || {};
  const sessionAttributes = body.session?.attributes || {};

  // Map request type to intent
  if (requestType === 'LaunchRequest') {
    return { intent: 'Welcome', parameters: {}, sessionAttributes };
  }
  if (requestType === 'SessionEndedRequest') {
    return { intent: 'Stop', parameters: {}, sessionAttributes };
  }
  if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
    return { intent: 'Stop', parameters: {}, sessionAttributes };
  }
  if (intentName === 'AMAZON.HelpIntent') {
    return { intent: 'Help', parameters: {}, sessionAttributes };
  }

  // Extract slot values
  const parameters = {};
  for (const [key, slot] of Object.entries(slots)) {
    if (slot.value) {
      parameters[key] = slot.value;
    }
  }

  return {
    intent: intentName,
    parameters,
    queryText: body.request?.inputSpeech?.transcript || '',
    sessionAttributes,
  };
}

function ssmlEscape(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildResponse(text, sessionAttributes = {}) {
  const escaped = ssmlEscape(text);
  // Add natural pauses between sentences
  const ssml = `<speak>${escaped.replace(/\.\s+/g, '. <break time="400ms"/> ')}</speak>`;

  return {
    version: '1.0',
    sessionAttributes,
    response: {
      outputSpeech: {
        type: 'SSML',
        ssml,
      },
      reprompt: {
        outputSpeech: {
          type: 'SSML',
          ssml: '<speak>You can ask me about your itinerary, budget, packing list, or recommendations.</speak>',
        },
      },
      shouldEndSession: false,
    },
  };
}

function buildLaunchResponse() {
  return {
    version: '1.0',
    sessionAttributes: {},
    response: {
      outputSpeech: {
        type: 'SSML',
        ssml: '<speak>Welcome to AI Trip Planner. You can ask me about your itinerary, budget, packing list, or recommendations. What would you like to know?</speak>',
      },
      reprompt: {
        outputSpeech: {
          type: 'SSML',
          ssml: '<speak>What would you like to know about your trip?</speak>',
        },
      },
      shouldEndSession: false,
    },
  };
}

function buildStopResponse() {
  return {
    version: '1.0',
    sessionAttributes: {},
    response: {
      outputSpeech: {
        type: 'SSML',
        ssml: '<speak>Goodbye! Happy travels.</speak>',
      },
      shouldEndSession: true,
    },
  };
}

function buildErrorResponse(text) {
  const escaped = ssmlEscape(text || "Sorry, something went wrong. Please try again.");
  return {
    version: '1.0',
    sessionAttributes: {},
    response: {
      outputSpeech: {
        type: 'SSML',
        ssml: `<speak>${escaped}</speak>`,
      },
      shouldEndSession: false,
    },
  };
}

module.exports = {
  detect,
  parseRequest,
  buildResponse,
  buildLaunchResponse,
  buildStopResponse,
  buildErrorResponse,
};
