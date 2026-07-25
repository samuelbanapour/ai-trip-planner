// POST /api/voice — Voice webhook for Google Assistant (Dialogflow) and Alexa.

const express = require('express');
const router = express.Router();
const dialogflow = require('../voice/dialogflow');
const alexa = require('../voice/alexa');
const { routeIntent, normalizeIntent } = require('../voice/intentRouter');

router.post('/', async (req, res) => {
  try {
    const body = req.body;

    // Detect platform
    let platform;
    let parsed;

    if (dialogflow.detect(body)) {
      platform = 'dialogflow';
      parsed = dialogflow.parseRequest(body);
    } else if (alexa.detect(body)) {
      platform = 'alexa';
      parsed = alexa.parseRequest(body);

      // Handle Alexa special requests
      if (parsed.intent === 'Stop') {
        return res.json(alexa.buildStopResponse());
      }
      if (parsed.intent === 'Help') {
        parsed.intent = 'Welcome';
      }
    } else {
      return res.status(400).json({
        error: 'Unrecognized voice platform. Expected Dialogflow or Alexa request format.',
      });
    }

    // Normalize intent and route to AI
    const normalizedIntent = normalizeIntent(platform, parsed.intent);
    const { text } = await routeIntent(normalizedIntent, parsed.parameters);

    // Build platform-appropriate response
    if (platform === 'dialogflow') {
      return res.json(dialogflow.buildResponse(text));
    } else {
      return res.json(alexa.buildResponse(text, parsed.sessionAttributes));
    }
  } catch (err) {
    console.error('Voice webhook error:', err);
    // Return error in the most generic format possible
    res.status(500).json({
      fulfillmentText: "Sorry, something went wrong. Please try again.",
    });
  }
});

module.exports = router;
