import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { TripProvider } from './contexts/TripContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import TripForm from './pages/TripForm';
import Itinerary from './pages/Itinerary';
import Budget from './pages/Budget';
import PackingList from './pages/PackingList';
import Recommendations from './pages/Recommendations';
import Settings from './pages/Settings';
import VoiceSetup from './pages/VoiceSetup';

export default function App() {
  return (
    <SettingsProvider>
      <TripProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="new" element={<TripForm />} />
              <Route path="trip/:id" element={<Itinerary />} />
              <Route path="trip/:id/budget" element={<Budget />} />
              <Route path="trip/:id/packing" element={<PackingList />} />
              <Route path="trip/:id/recommendations" element={<Recommendations />} />
              <Route path="settings" element={<Settings />} />
              <Route path="voice" element={<VoiceSetup />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TripProvider>
    </SettingsProvider>
  );
}
