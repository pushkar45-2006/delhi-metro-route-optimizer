// fareService.js
//
// Calculates an ESTIMATED fare for a journey, based on distance.
//
// IMPORTANT - READ THIS BEFORE TRUSTING THESE NUMBERS FOR REAL TRAVEL:
// This is a PROJECT-LEVEL FARE MODEL, not the live/official DMRC fare
// card. Real Delhi Metro fares depend on things this project does not
// model: smart card vs token pricing, time-of-day discounts, and fare
// slabs that get revised periodically by DMRC's Fare Fixation Committee.
//
// The slabs below are a SIMPLIFIED approximation, loosely modeled on
// publicly known past DMRC distance-based fare structure, used here
// only so the project has a believable, explainable fare feature:
//
//   distance <= 2 km   -> Rs 10
//   distance <= 5 km   -> Rs 20
//   distance <= 12 km  -> Rs 30
//   distance <= 21 km  -> Rs 40
//   distance <= 32 km  -> Rs 50
//   distance > 32 km   -> Rs 60
//
// If exact, current, official fares are needed later, only this file
// needs to change - nothing else in the project depends on how the
// fare is calculated internally.

function calculateFare(distanceKm) {
  if (distanceKm <= 2) {
    return 10;
  } else if (distanceKm <= 5) {
    return 20;
  } else if (distanceKm <= 12) {
    return 30;
  } else if (distanceKm <= 21) {
    return 40;
  } else if (distanceKm <= 32) {
    return 50;
  } else {
    return 60;
  }
}

module.exports = {
  calculateFare
};