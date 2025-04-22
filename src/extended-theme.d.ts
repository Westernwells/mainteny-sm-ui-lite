import {
  Palette as MuiPalette,
  PaletteOptions as MuiPaletteOptions,
} from '@mui/material/styles/createPalette';

declare module '@mui/material/styles' {
  interface Palette extends MuiPalette {
    blue: Palette['primary'];
    purple: Palette['primary'];
  }

  interface PaletteOption extends MuiPaletteOptions {
    blue?: PaletteOption['primary'];
    purple?: PaletteOption['primary'];
  }

  interface ColorSchemeTokens {
    // Add your custom color tokens here
    purple: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
  }
}
