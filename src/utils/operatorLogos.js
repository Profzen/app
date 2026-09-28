/**
 * operatorLogos.js
 * Maps operator/provider names to local image assets.
 * React Native requires static require() calls for bundled assets.
 */

const OPERATOR_LOGOS = {
  mtn: require('../../assets/operators/mtn.png'),
  'mtn mobile money': require('../../assets/operators/mtn.png'),
  'mtn momo': require('../../assets/operators/mtn.png'),
  orange: require('../../assets/operators/orange.png'),
  'orange money': require('../../assets/operators/orange.png'),
  moov: require('../../assets/operators/moov.png'),
  'moov money': require('../../assets/operators/moov.png'),
  'moov africa': require('../../assets/operators/moov.png'),
  wave: require('../../assets/operators/wave.png'),
  'wave money': require('../../assets/operators/wave.png'),
  airtel: require('../../assets/operators/airtel.png'),
  'airtel money': require('../../assets/operators/airtel.png'),
  safaricom: require('../../assets/operators/safaricom.png'),
  'safaricom m-pesa': require('../../assets/operators/safaricom.png'),
  mpesa: require('../../assets/operators/safaricom.png'),
  'm-pesa': require('../../assets/operators/safaricom.png'),
  'mixx by yas': require('../../assets/operators/mixx-by-yas.png'),
  'mixx-by-yas': require('../../assets/operators/mixx-by-yas.png'),
  mixx: require('../../assets/operators/mixx-by-yas.png'),
  tigo: require('../../assets/operators/tigo.png'),
  'tigo pesa': require('../../assets/operators/tigo.png'),
  togocom: require('../../assets/operators/togocom.png'),
  'togo telecom': require('../../assets/operators/togocom.png'),
  vodafone: require('../../assets/operators/vodafone.png'),
  'vodafone cash': require('../../assets/operators/vodafone.png'),
  telebirr: require('../../assets/operators/telebirr.png'),
  'ethio telecom': require('../../assets/operators/telebirr.png'),
  tnm: require('../../assets/operators/tnm.png'),
  zamtel: require('../../assets/operators/zamtel.png'),
};

/**
 * Get the logo image source for a given operator/provider name.
 * @param {string} name - The provider name (case insensitive).
 * Handles names with country suffixes like "Moov Money (Togo)".
 * @returns {object|null} Image source for use in <Image source={...} />, or null if not found.
 */
export function getOperatorLogo(name) {
  if (!name || typeof name !== 'string') return null;
  const key = name.toLowerCase().trim();
  if (OPERATOR_LOGOS[key]) return OPERATOR_LOGOS[key];

  // Strip parentheticals and retry
  const stripped = key.replace(/\s*\(.*?\)/g, ' ').trim().replace(/\s+/g, ' ');
  if (OPERATOR_LOGOS[stripped]) return OPERATOR_LOGOS[stripped];

  // Fuzzy keyword matching for all African mobile money / telecom operators
  if (key.includes('mixx') || key.includes('tmoney') || key.includes('t-money') || key.includes('yas')) {
    return OPERATOR_LOGOS['mixx'];
  }
  if (key.includes('moov') || key.includes('flooz')) {
    return OPERATOR_LOGOS['moov'];
  }
  if (key.includes('mtn')) {
    return OPERATOR_LOGOS['mtn'];
  }
  if (key.includes('orange')) {
    return OPERATOR_LOGOS['orange'];
  }
  if (key.includes('wave')) {
    return OPERATOR_LOGOS['wave'];
  }
  if (key.includes('airtel')) {
    return OPERATOR_LOGOS['airtel'];
  }
  if (key.includes('safaricom') || key.includes('mpesa') || key.includes('m-pesa')) {
    return OPERATOR_LOGOS['safaricom'];
  }
  if (key.includes('telebirr') || key.includes('ethio telecom')) {
    return OPERATOR_LOGOS['telebirr'];
  }
  if (key.includes('togocom') || key.includes('togo telecom')) {
    return OPERATOR_LOGOS['togocom'];
  }
  if (key.includes('vodafone')) {
    return OPERATOR_LOGOS['vodafone'];
  }
  if (key.includes('tigo')) {
    return OPERATOR_LOGOS['tigo'];
  }
  if (key.includes('tnm')) {
    return OPERATOR_LOGOS['tnm'];
  }
  if (key.includes('zamtel')) {
    return OPERATOR_LOGOS['zamtel'];
  }

  return null;
}

