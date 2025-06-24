import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import PdfUnitAddress from 'components/pdf-templates/containers/PdfUnitAddress';
import type {ContextProps} from 'context/PdfStylesProvider';

// Mocked context props for fontStyles and colors, cast to satisfy ContextProps
const contextProps = {
  fontStyles: {
    bold: {},
    regular: {},
  },
  primaryColor: '#000',
  secondaryColor: '#000',
} as unknown as Pick<
  ContextProps,
  'fontStyles' | 'primaryColor' | 'secondaryColor'
>;

const translate = (key: string) => key;

describe('PdfUnitAddress', () => {
  it('falls back to fullName when components are empty', () => {
    const address = {
      id: 'ed636e0b-db72-4c1e-8651-8ed69e8a7760',
      fullName: 'Willroiderstr. 3, 81545 München, Deutschland',
      countryCode: 'DE',
      location: {
        longitude: 11.5527316,
        latitude: 48.08979129999999,
      },
      component: {
        name: '',
        street: '',
        street2: '',
        city: '',
        postalCode: '',
        state: '',
        country: '',
        moreInfo: '',
      },
    };

    render(
      <PdfUnitAddress
        translate={translate}
        address={address}
        building=""
        fontStyles={contextProps.fontStyles}
        primaryColor={contextProps.primaryColor}
        secondaryColor={contextProps.secondaryColor}
      />,
    );
    expect(
      screen.getByText('Willroiderstr. 3, 81545 München, Deutschland'),
    ).toBeInTheDocument();
  });

  it('renders building and parsed street + postalCode city when provided', () => {
    const address = {
      id: 'ed636e0b-db72-4c1e-8651-8ed69e8a7760',
      fullName: 'Willroiderstr. 3, 81545 München, Deutschland',
      countryCode: 'DE',
      location: {
        longitude: 11.5527316,
        latitude: 48.08979129999999,
      },
      component: {
        name: '',
        street: 'Main St 123',
        street2: '',
        city: 'Berlin',
        postalCode: '10115',
        state: '',
        country: '',
        moreInfo: '',
      },
    };

    render(
      <PdfUnitAddress
        translate={translate}
        address={address}
        building="Bldg A"
        fontStyles={contextProps.fontStyles}
        primaryColor={contextProps.primaryColor}
        secondaryColor={contextProps.secondaryColor}
      />,
    );

    expect(screen.getByText('Bldg A')).toBeInTheDocument();
    expect(screen.getByText('Main St 123')).toBeInTheDocument();
    expect(screen.getByText('10115 Berlin')).toBeInTheDocument();
  });
});
