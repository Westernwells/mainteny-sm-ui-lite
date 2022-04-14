import {createTheme} from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      light: '#457892',
      main: '#0F4C64',
      dark: '#00243A',
      contrastText: '#FFFFFF',
      outlinedHoverBg: 'rgba(15, 76, 100, 0.08)',
    },
    secondary: {
      light: '#6CFFFF',
      main: '#00D1FF',
      dark: '#00A0CC',
      contrastText: '#FFFFFF',
      outlinedHoverBg: 'rgba(0, 209, 255, 0.08)',
      containedHoverBackground:
        'linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), #00D1FF',
    },
    text: {
      primary: '#222B45',
      secondary: '#8F9BB3',
      disabled: 'rgba(143, 155, 179, 0.5)',
    },
    action: {
      active: '#8F9BB3',
      hover: 'rgba(0, 209, 255, 0.04)',
      selected: 'rgba(0, 209, 255, 0.08)',
      disabled: 'rgba(143, 155, 179, 0.5)',
      disabledBackground: 'rgba(34, 43, 69, 0.12)',
      focus: 'rgba(34, 43, 69, 0.12)',
    },

    error: {
      light: '#FF605A',
      main: '#FF182F',
      dark: '#C30006',
      contrastText: '#FFFFFF',
    },
    info: {
      light: '#64B6F7',
      main: '#2196F3',
      dark: '#0B79D0',
      outlinedHoverBg: 'rgba(33, 150, 243, 0.08)',
      infoAlert:
        'linear-gradient(0deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), #2196F3',
      contrastText: '#FFFFFF',
    },
    warning: {
      light: '#FFB547',
      main: '#ED6C02',
      dark: '#C77700',
      contrastText: '#FFFFFF',
      outlinedHoverBg: 'rgba(237, 108, 2, 0.08)',
    },
    success: {
      light: '#61FFC0',
      main: '#00D68F',
      dark: '#00A361',
      contrastText: '#FFFFFF',
      outlinedHoverBg: 'rgba(97, 255, 192, 0.08)',
    },
    background: {
      default: '#F2F6F8',
    },
    inputBackground: {main: '#F7F9FC'},
    amber: {main: '#FF8F00', light: '#FFF8E1'},
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: 3,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: 0.2,
  },
  typography: {
    fontFamily: ['"Open Sans"', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    // htmlFontSize: 10,
    // root: {},
    h1: {
      fontWeight: 400,
      fontSize: '3.052rem',
      lineHeight: 1.16,
      letterSpacing: '-1.5px',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.441rem',
      lineHeight: 1.2,
      letterSpacing: '-0.5px',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.953rem',
      lineHeight: '56.02px',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.563rem',
      lineHeight: 1.25,
      letterSpacing: '0.25px',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.33,
      letterSpacing: '-1.5px',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.15px',
      // [breakpoints.down("xs")]: {
      //   fontSize: "3rem",
      //   color: 'red'
      // }
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.75,
      letterSpacing: '0.15px',
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.57,
      letterSpacing: '0.1px',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.15px',
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.15px',
    },
    caption: {
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.66,
      letterSpacing: '0.4px',
    },
    overline: {
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 2.66,
      letterSpacing: '1px',
    },
  },
  state: {
    hover: 'rgba(15, 76, 100, 0.08)',
    ratingActive: '#FFB400',
  },
  components: {
    MuiButton: {
      variants: [
        {
          props: {size: 'large'},
          style: {
            fontWeight: 600,
            fontSize: '0.9375rem',
            lineHeight: 1.73,
            letterSpacing: '0.15px',
          },
        },
        {
          props: {size: 'medium'},
          style: {
            fontWeight: 600,
            fontSize: '0.9375rem',
            lineHeight: 1.66,
            letterSpacing: '0.4px',
          },
        },
        {
          props: {size: 'small'},
          style: {
            fontWeight: 600,
            fontSize: '0.8125rem',
            lineHeight: 1.69,
            letterSpacing: '0.46px',
          },
        },
        {
          props: {variant: 'outlined'},
          style: {
            background: 'rgba(15, 76, 100, 0.08)',
            border: '1px solid rgba(15, 76, 100, 0.5)',
            boxSizing: 'border-box',
            borderRadius: '4px',
          },
        },
        {
          props: {color: 'danger'},
          style: {
            background: '#FF605A',
          },
        },
      ],
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 400,
          fontSize: '0.75rem',
          lineHeight: 2,
          letterSpacing: '0.15px',
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontWeight: 400,
          fontSize: '0.75rem',
          lineHeight: 1.66,
          letterSpacing: '0.4px',
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          fontWeight: 400,
          fontSize: '1rem',
          lineHeight: 1.5,
          letterSpacing: '0.15px',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 400,
          fontSize: '1.25rem',
          lineHeight: 1,
          letterSpacing: '0.14px',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #095369 0%, #043146 100%)',
          color: '#fff',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            background: '#457892',
            borderLeft: '8px solid #222B45',
            boxSizing: 'border-box',
          },
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        root: {
          '&.MuiGrid-item': {
            // background: 'red',
          },
        },
      },
    },
    MuiTypography: {
      variants: [
        {
          props: {variant: 'largeBtnText'},
          style: {
            fontWeight: 600,
            fontSize: '0.9375rem',
            lineHeight: 1.73,
            letterSpacing: '0.15px',
          },
        },

        {
          props: {variant: 'mediumBtnText'},
          style: {
            fontWeight: 600,
            fontSize: '0.875rem',
            lineHeight: 1.71,
            letterSpacing: '0.4px',
            textTransform: 'capitalize',
          },
        },
        {
          props: {variant: 'smallBtnText'},
          style: {
            fontWeight: 600,
            fontSize: '0.8125rem',
            lineHeight: 1.69,
            letterSpacing: '0.46px',
          },
        },
        {
          props: {color: 'textSuccess'},
          style: {
            color: '#00D68F',
          },
        },
        {
          props: {color: 'textWarning'},
          style: {
            color: '#ED6C02',
          },
        },
        {
          props: {variant: 'tableHeaderText'},
          style: {
            fontFamily: 'Open Sans',
            fontWeight: 500,
            fontSize: '0.875rem',
            lineHeight: 1.7,
            letterSpacing: '0.17px',
          },
        },
        {
          props: {variant: 'alertTitleText'},
          style: {
            fontFamily: 'Open Sans',
            fontWeight: 500,
            fontSize: '1rem',
            lineHeight: 1.5,
            letterSpacing: '0.15px',
          },
        },
        {
          props: {variant: 'helperText'},
          style: {
            fontFamily: 'Open Sans',
            fontWeight: 400,
            fontSize: '0.75rem',
            lineHeight: 1.66,
            letterSpacing: '0.4px',
          },
        },
        {
          props: {variant: 'chip'},
          style: {
            fontWeight: 400,
            fontSize: '0.8125rem',
            lineHeight: 0.72,
            letterSpacing: '0.16px',
          },
        },
        {
          props: {variant: 'inputLabel'},
          style: {
            fontWeight: 400,
            fontSize: '0.75rem',
            lineHeight: 0.75,
            letterSpacing: '0.15px',
          },
        },
        {
          props: {variant: 'tooltip'},
          style: {
            fontWeight: 500,
            fontSize: '0.625rem',
            lineHeight: 0.875,
          },
        },
      ],
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#222B45',
          },
        },
      },
    },
  },
});

// Breakponts
theme.typography.h4 = {
  ...theme.typography.h4,
  // [theme.breakpoints.down('lg')]: {
  //   backgroundColor: theme.palette.secondary.main,

  //   fontSize: '12px',
  //   lineHeight: 1.25,
  // },
};
