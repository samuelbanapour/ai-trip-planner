// CRUD routes for saved trips.

const express = require('express');
const router = express.Router();
const store = require('../../store');

router.get('/', (_req, res) => {
  res.json(store.getTrips());
});

router.post('/', (req, res) => {
  const trip = req.body;
  if (!trip || !trip.id) {
    return res.status(400).json({ error: 'trip with id is required' });
  }
  const list = store.saveTrip(trip);
  res.json(list.find((t) => t.id === trip.id));
});

router.delete('/:id', (req, res) => {
  const list = store.deleteTrip(req.params.id);
  res.json({ ok: true, trips: list });
});

module.exports = router;
