import {Address, AddressRecord, GoogleAddressComponent} from 'models/misc';

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

const findAddressComponent = (
  addressComponents: GoogleAddressComponent[],
  ...types: string[]
) =>
  types.reduce<GoogleAddressComponent | null>((found, type) => {
    if (found) return found;
    return (
      addressComponents.find(
        (component) => component.types && component.types.includes(type),
      ) || null
    );
  }, null);

export const getAddressRecordFromGoogleAddress = (address: {
  address_components: GoogleAddressComponent[];
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}): AddressRecord => {
  let {lat, lng} = {lat: 0, lng: 0};
  const addressLocation = address?.geometry?.location;
  if (addressLocation) {
    const addressLat = addressLocation?.lat;
    const addressLng = addressLocation?.lng;
    lat = typeof addressLat === 'function' ? addressLat?.() : addressLat;
    lng = typeof addressLng === 'function' ? addressLng?.() : addressLng;
  }
  const addressComponents = address?.address_components;
  const countryComponent = findAddressComponent(addressComponents, 'country');
  const countryCode = countryComponent?.short_name;
  const postalCode = findAddressComponent(
    addressComponents,
    'postal_code',
  )?.long_name;
  const country = countryComponent?.long_name;
  const city = findAddressComponent(
    addressComponents,
    'postal_town',
    'locality',
  )?.long_name;
  const state = findAddressComponent(
    addressComponents,
    'administrative_area_level_1',
  )?.long_name;

  // Extract street information
  let street = '';
  const streetName =
    findAddressComponent(addressComponents, 'route', 'street_address')
      ?.long_name || '';
  const streetNumber =
    findAddressComponent(addressComponents, 'street_number', 'premise')
      ?.long_name || '';

  if (streetName || streetNumber) {
    street = `${streetName} ${streetNumber}`.trim();
  } else {
    // Fallback to sublocality levels if route and street_number is missing
    const sublocalityLevels = [
      'sublocality_level_1',
      'sublocality_level_2',
      'sublocality_level_3',
      'sublocality',
    ];

    const sublocalities = Array.from(
      new Set(
        sublocalityLevels
          .map((level) => findAddressComponent(addressComponents, level))
          .filter((comp) => comp !== null),
      ),
    );

    if (sublocalities.length > 0) {
      street = sublocalities.map((comp) => comp.long_name).join(', ');
    }
  }

  const street2 = findAddressComponent(
    addressComponents,
    'subpremise',
  )?.long_name;
  const data: AddressRecord = {
    countryCode,
    fullName: address?.formatted_address,
    component: {
      postalCode,
      country,
      city,
      state,
      street,
      street2,
    },
    location: {
      latitude: lat,
      longitude: lng,
    },
  };
  return data;
};

export const isSwissAddress = (address?: Address) => {
  if (!address) return false;

  return (
    address.component?.country === 'Switzerland' || address.countryCode === 'CH'
  );
};
