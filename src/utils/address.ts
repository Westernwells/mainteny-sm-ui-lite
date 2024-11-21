import {Address} from 'models/misc';

/**
 * Util function to create an address string from its components(postalCode, street, city) if possible or full name.
 *
 * Fallback value if nothing is available -> '-'
 *
 * @param {Address} address - The address object.
 *
 * @returns {string} Converted address to string
 */
export const getAddressString = (address?: Address) => {
  if (!address) return '-';

  if (
    !address.component?.postalCode ||
    !address.component?.street ||
    !address.component?.city
  )
    return address.fullName ?? '-';
  return [
    address.component?.street,
    address.component?.postalCode,
    address.component?.city,
  ]
    .filter((value) => !!value)
    .join(', ');
};
