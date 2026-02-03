/**
 * Package configurations and utilities for gym membership subscriptions
 */

export const PACKAGE_TYPES = {
  BASIC: "basic",
  THREE_MONTHS: "3months",
  SIX_MONTHS: "6months",
  FULL_YEAR: "fullYear",
  TEST_3MIN: "test_3min",
};

/**
 * Get package duration in milliseconds
 * @param {string} packageType - The type of package
 * @returns {number} Duration in milliseconds
 */
export const getPackageDuration = (packageType) => {
  const durations = {
    [PACKAGE_TYPES.BASIC]: 30 * 24 * 60 * 60 * 1000, // 30 days (1 month)
    [PACKAGE_TYPES.THREE_MONTHS]: 90 * 24 * 60 * 60 * 1000, // 90 days (3 months)
    [PACKAGE_TYPES.SIX_MONTHS]: 180 * 24 * 60 * 60 * 1000, // 180 days (6 months)
    [PACKAGE_TYPES.FULL_YEAR]: 365 * 24 * 60 * 60 * 1000, // 365 days (1 year)
    [PACKAGE_TYPES.TEST_3MIN]: 3 * 60 * 1000, // 3 minutes for testing
  };

  return durations[packageType] || durations[PACKAGE_TYPES.BASIC];
};

/**
 * Get package details including name, duration, and price
 * @param {string} packageType - The type of package
 * @returns {object} Package details
 */
export const getPackageDetails = (packageType) => {
  const packages = {
    [PACKAGE_TYPES.BASIC]: {
      name: "Basic (Monthly)",
      duration: "30 days",
      durationDays: 30,
      price: 999,
    },
    [PACKAGE_TYPES.THREE_MONTHS]: {
      name: "3 Months Package",
      duration: "90 days",
      durationDays: 90,
      price: 2799,
    },
    [PACKAGE_TYPES.SIX_MONTHS]: {
      name: "6 Months Package",
      duration: "180 days",
      durationDays: 180,
      price: 5099,
    },
    [PACKAGE_TYPES.FULL_YEAR]: {
      name: "Full Year Package",
      duration: "365 days",
      durationDays: 365,
      price: 8999,
    },
    [PACKAGE_TYPES.TEST_3MIN]: {
      name: "Test Package (3 Minutes)",
      duration: "3 minutes",
      durationDays: 0.002, // approximately 3 minutes in days
      price: 0,
    },
  };

  return packages[packageType] || packages[PACKAGE_TYPES.BASIC];
};

/**
 * Calculate expiry date based on package type
 * @param {string} packageType - The type of package
 * @param {Date} startDate - The start date (default: today)
 * @returns {Date} Expiry date
 */
export const calculateExpiryDate = (packageType, startDate = new Date()) => {
  const duration = getPackageDuration(packageType);
  return new Date(startDate.getTime() + duration);
};

/**
 * Check if a membership has expired
 * @param {Date} expiryDate - The expiry date of the membership
 * @returns {boolean} True if expired, false otherwise
 */
export const isMembershipExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

/**
 * Get days remaining until expiry
 * @param {Date} expiryDate - The expiry date of the membership
 * @returns {number} Days remaining (negative if expired)
 */
export const getDaysRemaining = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get all available packages
 * @returns {object} All package information
 */
export const getAllPackages = () => {
  return {
    basic: getPackageDetails(PACKAGE_TYPES.BASIC),
    threeMonths: getPackageDetails(PACKAGE_TYPES.THREE_MONTHS),
    sixMonths: getPackageDetails(PACKAGE_TYPES.SIX_MONTHS),
    fullYear: getPackageDetails(PACKAGE_TYPES.FULL_YEAR),
    test3min: getPackageDetails(PACKAGE_TYPES.TEST_3MIN),
  };
};
