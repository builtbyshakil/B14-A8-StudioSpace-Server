export const CATEGORIES = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
];

export const SORTS = {
  newest: { createdAt: -1 },
  rating: { rating: -1, createdAt: -1 },
  "price-low": { hourlyRate: 1 },
  "price-high": { hourlyRate: -1 },
};
