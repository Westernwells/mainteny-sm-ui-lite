import React from 'react';

/* eslint-disable no-unused-vars */
declare module '@mui/material/styles' {
  interface TypographyVariants {
    largeBtnText: React.CSSProperties;
    mediumBtnText: React.CSSProperties;
    smallBtnText: React.CSSProperties;
    tableHeaderText: React.CSSProperties;
    alertTitleText: React.CSSProperties;
    helperText: React.CSSProperties;
    chip: React.CSSProperties;
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
  }

  interface CustomPalleteColor {
    outlinedHoverBg?: string;
    infoAlert?: string;
  }
  interface PaletteColor extends CustomPalleteColor {}
  interface SimplePaletteColorOptions extends CustomPalleteColor {}

  interface CustomPalette {
    danger?: SimplePaletteColorOptions;
    inputBackground: SimplePaletteColorOptions;
    amber: SimplePaletteColorOptions;
  }
  interface Palette extends CustomPalette {}
  interface PaletteOptions extends CustomPalette {}

  interface CustomTheme {
    state?: {
      hover?: string;
      ratingActive?: string;
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
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    danger: true;
  }
}

// ButtonPropsVariantOverrides

// ButtonPropsColorOverrides
/* eslint-enable no-unused-vars */
