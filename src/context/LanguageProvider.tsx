import React, {ReactNode, useMemo, useState} from 'react';

interface Props {
  children?: ReactNode;
}

interface ContextValue {
  language: string;
  setLanguage: (val: string) => void;
}

const initialValue = {
  language: 'EN',
  setLanguage: () => {},
};

export const LanguageContext = React.createContext<ContextValue>(initialValue);

export const LanguageProvider = ({children}: Props) => {
  const [language, setLanguage] = useState('EN');

  return (
    <LanguageContext.Provider
      value={useMemo(
        () => ({
          language,
          setLanguage,
        }),
        [language],
      )}>
      {children}
    </LanguageContext.Provider>
  );
};
