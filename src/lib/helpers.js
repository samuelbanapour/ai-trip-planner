// Date, currency, and formatting helpers.

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function getDayCount(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

export function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function getDaysOfWeek() {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

export function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function getMinDate() {
  return getToday();
}

export function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  return getDayCount(startDate, endDate);
}

// Category icons for UI
export const CATEGORY_ICONS = {
  sightseeing: '🏛️',
  food: '🍽️',
  transport: '🚗',
  shopping: '🛍️',
  nature: '🌿',
  culture: '🎭',
  nightlife: '🌙',
  accommodation: '🏨',
  activity: '⚡',
};

export const TRAVEL_STYLES = [
  { id: 'budget', label: 'Budget', icon: '💰', description: 'Save money, maximize experience' },
  { id: 'mid', label: 'Mid-Range', icon: '⚖️', description: 'Balanced comfort and cost' },
  { id: 'luxury', label: 'Luxury', icon: '✨', description: 'Premium experiences' },
];

export const INTERESTS = [
  'Museums', 'Nature', 'Food & Dining', 'Nightlife', 'Shopping',
  'History', 'Architecture', 'Beaches', 'Hiking', 'Photography',
  'Art', 'Music', 'Sports', 'Adventure', 'Wellness & Spa',
  'Family-Friendly', 'Romance', 'Science', 'Markets', 'Festivals',
];
