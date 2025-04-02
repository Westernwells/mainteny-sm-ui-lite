import {createContext, PropsWithChildren, useContext, useMemo} from 'react';
import {Font} from '@react-pdf/renderer';
import MontserratBold from 'assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import MontserratRegular from 'assets/fonts/Montserrat/Montserrat-Regular.ttf';
import NotoSansGeorgianRegular from 'assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from 'assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';
import AventaRegular from 'assets/fonts/Aventa/Aventa-Regular.ttf';
import AventaBold from 'assets/fonts/Aventa/Aventa-Bold.ttf';
import InterRegular from 'assets/fonts/Inter/Inter-Regular.ttf';
import InterBold from 'assets/fonts/Inter/Inter-Bold.ttf';
import UbuntuRegular from 'assets/fonts/Ubuntu/Ubuntu-Regular.ttf';
import UbuntuBold from 'assets/fonts/Ubuntu/Ubuntu-Bold.ttf';
import ArialRegular from 'assets/fonts/Arial/Arial-Regular.ttf';
import ArialBold from 'assets/fonts/Arial/Arial-Bold.ttf';
import LatoRegular from 'assets/fonts/Lato/Lato-Regular.ttf';
import LatoBold from 'assets/fonts/Lato/Lato-Bold.ttf';
import TimesNewRomanRegular from 'assets/fonts/TimesNewRoman/TimesNewRoman-Regular.ttf';
import TimesNewRomanBold from 'assets/fonts/TimesNewRoman/TimesNewRoman-Bold.ttf';
import {
  useQueryClientStorageData,
  useUpdateServiceCompanyClientStorage,
} from 'hooks/useClientStorage';
import {ClientStorageKeys} from 'models/client-storage';
import MontserratItalic from 'assets/fonts/Montserrat/Montserrat-Italic.ttf';
import MontserratBoldItalic from 'assets/fonts/Montserrat/Montserrat-BoldItalic.ttf';
import {UserCompanyContext} from 'context/UserCompanyProvider';

Font.register({
  family: 'Montserrat-Bold',
  format: 'truetype',
  src: MontserratBold,
});

Font.register({
  family: 'Montserrat-Regular',
  fonts: [
    {src: MontserratRegular},
    {src: MontserratBold, fontWeight: 'bold'},
    {src: MontserratItalic, fontStyle: 'italic'},
    {
      src: MontserratBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

Font.register({
  family: 'NotoSans-Regular',
  format: 'truetype',
  src: NotoSansGeorgianRegular,
});

Font.register({
  family: 'NotoSans-Bold',
  format: 'truetype',
  src: NotoSansGeorgianBold,
});

Font.register({
  family: 'Aventa-Regular',
  format: 'truetype',
  src: AventaRegular,
});

Font.register({
  family: 'Aventa-Bold',
  format: 'truetype',
  src: AventaBold,
});

Font.register({
  family: 'Inter-Regular',
  format: 'truetype',
  src: InterRegular,
});

Font.register({
  family: 'Inter-Bold',
  format: 'truetype',
  src: InterBold,
});

Font.register({
  family: 'Ubuntu-Regular',
  format: 'truetype',
  src: UbuntuRegular,
});

Font.register({
  family: 'Ubuntu-Bold',
  format: 'truetype',
  src: UbuntuBold,
});

Font.register({
  family: 'Arial-Regular',
  format: 'truetype',
  src: ArialRegular,
});

Font.register({
  family: 'Arial-Bold',
  format: 'truetype',
  src: ArialBold,
});

Font.register({
  family: 'Lato-Regular',
  format: 'truetype',
  src: LatoRegular,
});

Font.register({
  family: 'Lato-Bold',
  format: 'truetype',
  src: LatoBold,
});

Font.register({
  family: 'TimesNewRoman-Regular',
  format: 'truetype',
  src: TimesNewRomanRegular,
});

Font.register({
  family: 'TimesNewRoman-Bold',
  format: 'truetype',
  src: TimesNewRomanBold,
});

export type ContextProps = {
  currentPdfFont: string;
  fontStyles: {
    regular: {
      fontFamily: string;
    };
    bold: {
      fontFamily: string;
    };
  };
  disableFontSelection: boolean;
  primaryColor: string;
  secondaryColor: string;
  setPdfFont: (val: string) => void;
  setPdfColors: (field: 'primaryColor' | 'secondaryColor', val: string) => void;
};

// mapping the display name to the font names
const LANGUAGE_TO_FONTS: Record<string, string> = {
  Montserrat: 'Montserrat',
  Aventa: 'Aventa',
  Inter: 'Inter',
  Ubuntu: 'Ubuntu',
  Arial: 'Arial',
  Lato: 'Lato',
  'Times New Roman': 'Times New Roman',
};

const initialValue: ContextProps = {
  currentPdfFont: 'Montserrat',
  fontStyles: {
    regular: {
      fontFamily: 'Montserrat-Regular',
    },
    bold: {
      fontFamily: 'Montserrat-Bold',
    },
  },
  disableFontSelection: false,
  primaryColor: '#212121',
  secondaryColor: '#616161',
  setPdfFont: () => {},
  setPdfColors: () => {},
};

export const PdfStylesContext = createContext<ContextProps>(initialValue);

export const PdfStylesProvider = ({children}: PropsWithChildren<unknown>) => {
  const {company} = useContext(UserCompanyContext);
  const companyId = company?.id || '';

  const {mutateAsync: updateClientStorage} =
    useUpdateServiceCompanyClientStorage('PDF styles updated successfully');

  // disable font for Georgian language
  const disableFontSelection = useMemo(
    () => (company?.language as string) === 'ka-ge',
    [company],
  );

  const {data: clientPdfFont} = useQueryClientStorageData({
    serviceCompanyId: companyId,
    params: {key: ClientStorageKeys.PDF_FONT},
    options: {
      enabled: !!companyId,
    },
  });

  const {data: clientPdfColors} = useQueryClientStorageData({
    serviceCompanyId: companyId,
    params: {key: ClientStorageKeys.PDF_COLORS},
    options: {
      enabled: !!companyId,
    },
  });

  const onFontChange = async (value: string) => {
    await updateClientStorage({
      body: {
        key: ClientStorageKeys.PDF_FONT,
        value,
      },
      serviceCompanyId: companyId,
    });
  };

  const onColorChange = async (
    field: 'primaryColor' | 'secondaryColor',
    newColor: string,
  ) => {
    const currentColors = clientPdfColors?.value
      ? JSON.parse(clientPdfColors?.value)
      : {
          primaryColor: '#212121',
          secondaryColor: '#616161',
        };

    const newValues = {...currentColors, [field]: newColor};

    await updateClientStorage({
      body: {
        key: ClientStorageKeys.PDF_COLORS,
        value: JSON.stringify(newValues),
      },
      serviceCompanyId: companyId,
    });
  };

  const values = useMemo(() => {
    const selectedClientFont = clientPdfFont?.value || 'Montserrat';
    const {primaryColor, secondaryColor} = clientPdfColors?.value
      ? JSON.parse(clientPdfColors?.value)
      : {
          primaryColor: '#212121',
          secondaryColor: '#616161',
        };

    const selectedFontStyleName = disableFontSelection
      ? 'NotoSans'
      : LANGUAGE_TO_FONTS[selectedClientFont];

    const fontStyles = {
      regular: {
        fontFamily: `${selectedFontStyleName}-Regular`,
      },
      bold: {
        fontFamily: `${selectedFontStyleName}-Bold`,
      },
    };

    return {
      currentPdfFont: selectedClientFont,
      fontStyles,
      disableFontSelection,
      primaryColor,
      secondaryColor,
      setPdfFont: onFontChange,
      setPdfColors: onColorChange,
    };
  }, [clientPdfFont, onFontChange, disableFontSelection]);

  return (
    <PdfStylesContext.Provider value={values}>
      {children}
    </PdfStylesContext.Provider>
  );
};
