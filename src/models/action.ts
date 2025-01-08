import {ReactNode} from 'react';

// Used for table action menu and details action menu
export type MenuAction = {
  label: string;
  icon: ReactNode | JSX.Element;
  showBorder?: boolean;
  disabled?: boolean;
  onClick: () => void;
};
