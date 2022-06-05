import React from 'react';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    largeBtnText: React.CSSProperties;
    mediumBtnText: React.CSSProperties;
    smallBtnText: React.CSSProperties;
    tableHeaderText: React.CSSProperties;
    alertTitleText: React.CSSProperties;
    helperText: React.CSSProperties;
    chip: React.CSSProperties;
    inputLabel: React.CSSProperties;
    tooltip: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    largeBtnText?: React.CSSProperties;
    mediumBtnText?: React.CSSProperties;
    smallBtnText?: React.CSSProperties;
    tableHeaderText?: React.CSSProperties;
    alertTitleText?: React.CSSProperties;
    helperText?: React.CSSProperties;
    chip?: React.CSSProperties;
    inputLabel?: React.CSSProperties;
    tooltip?: React.CSSProperties;
  }

  interface CustomPalleteColor {
    outlinedHoverBg?: string;
    containedHoverBackground?: string;
    infoAlert?: string;
  }
  interface PaletteColor extends CustomPalleteColor {}
  interface SimplePaletteColorOptions extends CustomPalleteColor {}

  interface CustomPalette {
    danger?: SimplePaletteColorOptions;
    inputBackground: SimplePaletteColorOptions;
    amber: SimplePaletteColorOptions;
    eden: SimplePaletteColorOptions;
    suvaGrey: SimplePaletteColorOptions;
  }
  interface Palette extends CustomPalette {}
  interface PaletteOptions extends CustomPalette {}

  interface CustomTheme {
    state: {
      hover: string;
      ratingActive: string;
      aubergine: string;
    };
  }

  interface Theme extends CustomTheme {}
  interface ThemeOptions extends CustomTheme {}
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    largeBtnText: true;
    mediumBtnText: true;
    smallBtnText: true;
    tableHeaderText: true;
    alertTitleText: true;
    helperText: true;
    chip: true;
    inputLabel: true;
    tooltip: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    danger: true;
  }
}

// ButtonPropsVariantOverrides

// ButtonPropsColorOverrides
