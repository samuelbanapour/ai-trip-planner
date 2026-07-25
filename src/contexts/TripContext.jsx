import React, { createContext, useContext, useReducer, useEffect } from 'react';

const TripContext = createContext(null);

const STORAGE_KEY = 'trip-planner-trips';

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TRIPS':
      return { ...state, trips: action.trips };
    case 'SET_ACTIVE_TRIP':
      return { ...state, activeTrip: action.trip };
    case 'UPDATE_ACTIVE_TRIP':
      return {
        ...state,
        activeTrip: state.activeTrip
          ? { ...state.activeTrip, ...action.updates }
          : null,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_STREAMING':
      return { ...state, streaming: action.streaming };
    default:
      return state;
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const initialState = {
  trips: [],
  activeTrip: null,
  loading: false,
  error: null,
  streaming: false,
};

export function TripProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load trips from storage on mount
  useEffect(() => {
    if (window.tripPlannerAPI?.getTrips) {
      window.tripPlannerAPI.getTrips().then((trips) => {
        dispatch({ type: 'SET_TRIPS', trips: trips || [] });
      });
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) dispatch({ type: 'SET_TRIPS', trips: JSON.parse(saved) });
      } catch { /* ignore */ }
    }
  }, []);

  // Persist trips
  useEffect(() => {
    if (window.tripPlannerAPI?.saveTrip) {
      // Electron mode — trips are saved individually via IPC
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.trips));
    }
  }, [state.trips]);

  const createTrip = (tripData) => {
    const trip = {
      id: generateId(),
      ...tripData,
      itinerary: null,
      budget: null,
      packingList: null,
      recommendations: null,
      createdAt: Date.now(),
    };
    dispatch({ type: 'SET_TRIPS', trips: [...state.trips, trip] });
    dispatch({ type: 'SET_ACTIVE_TRIP', trip });

    if (window.tripPlannerAPI?.saveTrip) {
      window.tripPlannerAPI.saveTrip(trip);
    }

    return trip;
  };

  const updateTrip = (id, updates) => {
    const updatedTrips = state.trips.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
    );
    dispatch({ type: 'SET_TRIPS', trips: updatedTrips });

    if (state.activeTrip?.id === id) {
      dispatch({ type: 'SET_ACTIVE_TRIP', trip: { ...state.activeTrip, ...updates } });
    }

    const updated = updatedTrips.find((t) => t.id === id);
    if (updated && window.tripPlannerAPI?.saveTrip) {
      window.tripPlannerAPI.saveTrip(updated);
    }
  };

  const deleteTrip = (id) => {
    const filtered = state.trips.filter((t) => t.id !== id);
    dispatch({ type: 'SET_TRIPS', trips: filtered });

    if (state.activeTrip?.id === id) {
      dispatch({ type: 'SET_ACTIVE_TRIP', trip: null });
    }

    if (window.tripPlannerAPI?.deleteTrip) {
      window.tripPlannerAPI.deleteTrip(id);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  };

  const openTrip = (trip) => {
    dispatch({ type: 'SET_ACTIVE_TRIP', trip });
  };

  return (
    <TripContext.Provider value={{ ...state, dispatch, createTrip, updateTrip, deleteTrip, openTrip }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within TripProvider');
  return ctx;
}
