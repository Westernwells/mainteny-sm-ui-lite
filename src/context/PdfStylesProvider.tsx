import {createContext, PropsWithChildren, useContext, useMemo} from 'react';
import {Font} from '@react-pdf/renderer';
import MontserratBold from 'assets/fonts/Montserrat/Montserrat-SemiBold.ttf';
import MontserratRegular from 'assets/fonts/Montserrat/Montserrat-Regular.ttf';
import NotoSansGeorgianRegular from 'assets/fonts/NotoSans/NotoSansGeorgian-Regular.ttf';
import NotoSansGeorgianBold from 'assets/fonts/NotoSans/NotoSansGeorgian-Bold.ttf';
import NotoSansGeorgianItalic from 'assets/fonts/NotoSans/NotoSansGeorgian-Italic.ttf';
import AventaRegular from 'assets/fonts/Aventa/Aventa-Regular.ttf';
import AventaBold from 'assets/fonts/Aventa/Aventa-Bold.ttf';
import AventaItalic from 'assets/fonts/Aventa/Aventa-Italic.ttf';
import AventaBoldItalic from 'assets/fonts/Aventa/Aventa-BoldItalic.ttf';
import InterRegular from 'assets/fonts/Inter/Inter-Regular.ttf';
import InterBold from 'assets/fonts/Inter/Inter-Bold.ttf';
import InterItalic from 'assets/fonts/Inter/Inter-Italic.ttf';
import InterBoldItalic from 'assets/fonts/Inter/Inter-BoldItalic.ttf';
import UbuntuRegular from 'assets/fonts/Ubuntu/Ubuntu-Regular.ttf';
import UbuntuBold from 'assets/fonts/Ubuntu/Ubuntu-Bold.ttf';
import UbuntuItalic from 'assets/fonts/Ubuntu/Ubuntu-Italic.ttf';
import UbuntuBoldItalic from 'assets/fonts/Ubuntu/Ubuntu-BoldItalic.ttf';
import ArialRegular from 'assets/fonts/Arial/Arial-Regular.ttf';
import ArialBold from 'assets/fonts/Arial/Arial-Bold.ttf';
import ArialItalic from 'assets/fonts/Arial/Arial-Italic.ttf';
import ArialBoldItalic from 'assets/fonts/Arial/Arial-BoldItalic.ttf';
import LatoRegular from 'assets/fonts/Lato/Lato-Regular.ttf';
import LatoBold from 'assets/fonts/Lato/Lato-Bold.ttf';
import LatoItalic from 'assets/fonts/Lato/Lato-Italic.ttf';
import LatoBoldItalic from 'assets/fonts/Lato/Lato-BoldItalic.ttf';
import TimesNewRomanRegular from 'assets/fonts/TimesNewRoman/TimesNewRoman-Regular.ttf';
import TimesNewRomanBold from 'assets/fonts/TimesNewRoman/TimesNewRoman-Bold.ttf';
import TimesNewRomanItalic from 'assets/fonts/TimesNewRoman/TimesNewRoman-Italic.ttf';
import TimesNewRomanBoldItalic from 'assets/fonts/TimesNewRoman/TimesNewRoman-BoldItalic.ttf';
import {
  useQueryClientStorageData,
  useUpdateServiceCompanyClientStorage,
} from 'hooks/useClientStorage';
import {ClientStorageKeys} from 'models/client-storage';
import MontserratItalic from 'assets/fonts/Montserrat/Montserrat-Italic.ttf';
import MontserratBoldItalic from 'assets/fonts/Montserrat/Montserrat-BoldItalic.ttf';
import {UserCompanyContext} from 'context/UserCompanyProvider';

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
  family: 'Montserrat',
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
  family: 'Montserrat-Bold',
  src: MontserratBold,
});

Font.register({
  family: 'NotoSans-Regular',
  fonts: [
    {src: NotoSansGeorgianRegular},
    {src: NotoSansGeorgianBold, fontWeight: 'bold'},
    {src: NotoSansGeorgianItalic, fontStyle: 'italic'},
    {
      src: MontserratBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

Font.register({
  family: 'NotoSans',
  fonts: [
    {src: NotoSansGeorgianRegular},
    {src: NotoSansGeorgianBold, fontWeight: 'bold'},
    {src: NotoSansGeorgianItalic, fontStyle: 'italic'},
    {
      src: MontserratBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

Font.register({
  family: 'NotoSans-Bold',
  src: NotoSansGeorgianBold,
});

Font.register({
  family: 'Aventa-Regular',
  fonts: [
    {src: AventaRegular},
    {src: AventaBold, fontWeight: 'bold'},
    {src: AventaItalic, fontStyle: 'italic'},
    {
      src: AventaBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

Font.register({
  family: 'Aventa',
  fonts: [
    {src: AventaRegular},
    {src: AventaBold, fontWeight: 'bold'},
    {src: AventaItalic, fontStyle: 'italic'},
    {
      src: AventaBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

Font.register({
  family: 'Aventa-Bold',
  src: AventaBold,
});

Font.register({
  family: 'Inter-Regular',
  fonts: [
    {src: InterRegular},
    {src: InterBold, fontWeight: 'bold'},
    {src: InterItalic, fontStyle: 'italic'},
    {
      src: InterBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});
Font.register({
  family: 'Inter',
  fonts: [
    {src: InterRegular},
    {src: InterBold, fontWeight: 'bold'},
    {src: InterItalic, fontStyle: 'italic'},
    {
      src: InterBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

Font.register({
  family: 'Inter-Bold',
  src: InterBold,
});

Font.register({
  family: 'Ubuntu-Regular',
  fonts: [
    {src: UbuntuRegular},
    {src: UbuntuBold, fontWeight: 'bold'},
    {src: UbuntuItalic, fontStyle: 'italic'},
    {
      src: UbuntuBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

Font.register({
  family: 'Ubuntu',
  fonts: [
    {src: UbuntuRegular},
    {src: UbuntuBold, fontWeight: 'bold'},
    {src: UbuntuItalic, fontStyle: 'italic'},
    {
      src: UbuntuBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

Font.register({
  family: 'Ubuntu-Bold',
  src: UbuntuBold,
});

Font.register({
  family: 'Arial-Regular',
  fonts: [
    {src: ArialRegular},
    {src: ArialBold, fontWeight: 'bold'},
    {src: ArialItalic, fontStyle: 'italic'},
    {
      src: ArialBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

Font.register({
  family: 'Arial',
  fonts: [
    {src: ArialRegular},
    {src: ArialBold, fontWeight: 'bold'},
    {src: ArialItalic, fontStyle: 'italic'},
    {
      src: ArialBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

Font.register({
  family: 'Arial-Bold',
  src: ArialBold,
});

Font.register({
  family: 'Lato-Regular',
  fonts: [
    {src: LatoRegular},
    {src: LatoBold, fontWeight: 'bold'},
    {src: LatoItalic, fontStyle: 'italic'},
    {
      src: LatoBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

Font.register({
  family: 'Lato',
  fonts: [
    {src: LatoRegular},
    {src: LatoBold, fontWeight: 'bold'},
    {src: LatoItalic, fontStyle: 'italic'},
    {
      src: LatoBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

Font.register({
  family: 'Lato-Bold',
  src: LatoBold,
});

Font.register({
  family: 'TimesNewRoman-Regular',
  fonts: [
    {src: TimesNewRomanRegular},
    {src: TimesNewRomanBold, fontWeight: 'bold'},
    {src: TimesNewRomanItalic, fontStyle: 'italic'},
    {
      src: TimesNewRomanBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

Font.register({
  family: 'Times New Roman',
  fonts: [
    {src: TimesNewRomanRegular},
    {src: TimesNewRomanBold, fontWeight: 'bold'},
    {src: TimesNewRomanItalic, fontStyle: 'italic'},
    {
      src: TimesNewRomanBoldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

Font.register({
  family: 'TimesNewRoman-Bold',
  src: TimesNewRomanBold,
});

export type FontStyle = {
  name: string;
  regular: {
    fontFamily: string;
  };
  bold: {
    fontFamily: string;
  };
};

export type ContextProps = {
  currentPdfFont: string;
  fontStyles: FontStyle;
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
  'Times New Roman': 'TimesNewRoman',
};

const initialValue: ContextProps = {
  currentPdfFont: 'Montserrat',
  fontStyles: {
    name: 'Montserrat',
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
      name: selectedFontStyleName,
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
