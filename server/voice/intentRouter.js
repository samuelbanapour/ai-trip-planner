// Voice intent router — maps normalized intents to AI prompts and orchestrates responses.

const { complete } = require('../ai/fallback');
const store = require('../../store');
const voicePrompts = require('./voicePrompts');

/**
 * Normalize intent name from platform-specific to internal format.
 */
function normalizeIntent(platform, rawIntent, requestType) {
  const intentMap = {
    dialogflow: {
      'GetItinerary': 'GetItinerary',
      'GetBudget': 'GetBudget',
      'GetPackingList': 'GetPackingList',
      'GetRecommendations': 'GetRecommendations',
      'AskTrip': 'AskTrip',
      'GetWeather': 'GetWeather',
      'input.welcome': 'Welcome',
    },
    alexa: {
      'GetItineraryIntent': 'GetItinerary',
      'GetBudgetIntent': 'GetBudget',
      'GetPackingListIntent': 'GetPackingList',
      'GetRecommendationsIntent': 'GetRecommendations',
      'AskTripIntent': 'AskTrip',
      'GetWeatherIntent': 'GetWeather',
    },
  };

  const map = intentMap[platform] || {};
  return map[rawIntent] || rawIntent;
}

/**
 * Find the most relevant trip based on parameters or return the most recent.
 */
function findTrip(parameters) {
  const trips = store.getTrips();
  if (trips.length === 0) return null;

  // If a specific destination is mentioned, try to match
  if (parameters.destination) {
    const match = trips.find((t) =>
      t.destination?.toLowerCase().includes(parameters.destination.toLowerCase())
    );
    if (match) return match;
  }

  // Default to the most recently updated trip
  return trips.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
}

/**
 * Route a normalized intent to the appropriate AI prompt and get a response.
 */
async function routeIntent(normalizedIntent, parameters) {
  const settings = store.getSettings();
  const trip = findTrip(parameters);

  if (!trip && normalizedIntent !== 'Welcome') {
    return {
      text: "You don't have any trips saved yet. Open the AI Trip Planner app to create your first trip.",
      trip: null,
    };
  }

  let prompt;

  switch (normalizedIntent) {
    case 'GetItinerary': {
      const dayNumber = parameters.day || parameters.dayNumber || null;
      prompt = voicePrompts.itinerary(trip, dayNumber ? parseInt(dayNumber) : null);
      break;
    }
    case 'GetBudget':
      prompt = voicePrompts.budget(trip);
      break;
    case 'GetPackingList':
      prompt = voicePrompts.packing(trip);
      break;
    case 'GetRecommendations': {
      const category = parameters.category || parameters.query || null;
      prompt = voicePrompts.recommendations(trip, category);
      break;
    }
    case 'AskTrip': {
      const question = parameters.question || parameters.query || 'Tell me about my trip';
      prompt = voicePrompts.tripQuestion(trip, question);
      break;
    }
    case 'GetWeather':
      prompt = voicePrompts.weather(trip);
      break;
    case 'Welcome':
      prompt = voicePrompts.welcome();
      break;
    default:
      prompt = {
        system: 'You are a helpful travel assistant. Respond concisely in 2-3 spoken sentences.',
        user: parameters.query || 'How can you help me?',
      };
  }

  try {
    const result = await complete(
      [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      settings.preferredProvider || 'auto',
      settings,
      { maxTokens: 300, temperature: 0.7 }
    );

    return {
      text: result.text.trim(),
      trip,
    };
  } catch (err) {
    return {
      text: "I'm having trouble reaching the AI service right now. Please try again in a moment.",
      trip,
      error: err.message,
    };
  }
}

module.exports = { routeIntent, normalizeIntent, findTrip };
