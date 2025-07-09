import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';
import {DropzoneState} from 'react-dropzone';

type ProviderProps = Partial<
  Pick<DropzoneState, 'open' | 'getRootProps' | 'getInputProps'>
>;

type ContextValue = ProviderProps & {
  setOpen: (value: () => void) => void;
  setGetInputProps: (value: DropzoneState['getInputProps']) => void;
  setGetRootProps: (value: DropzoneState['getRootProps']) => void;
};

const initialValue = {
  open: undefined,
  getRootProps: undefined,
  getInputProps: undefined,
  setOpen: () => {},
  setGetInputProps: () => {},
  setGetRootProps: () => {},
};

const DropzoneContext = createContext<ContextValue>(initialValue);

export const useDropzoneContext = () => {
  const context = useContext(DropzoneContext);
  if (!context) {
    throw new Error(
      'useDropzoneContext must be used within a DropzoneProvider',
    );
  }
  return context;
};

export const DropzoneProvider = ({
  children,
}: PropsWithChildren<ProviderProps>) => {
  const [open, setOpen] = useState<(() => void) | undefined>();
  const [getInputProps, setGetInputProps] = useState<
    DropzoneState['getInputProps'] | undefined
  >();
  const [getRootProps, setGetRootProps] = useState<
    DropzoneState['getRootProps'] | undefined
  >();

  // Wrapper functions to handle function storage correctly
  const handleSetOpen = (fn: () => void) => {
    setOpen(() => fn); // Store the function, don't call it
  };

  const handleSetGetInputProps = (fn: DropzoneState['getInputProps']) => {
    setGetInputProps(() => fn);
  };

  const handleSetGetRootProps = (fn: DropzoneState['getRootProps']) => {
    setGetRootProps(() => fn);
  };

  const value = useMemo(
    () => ({
      open,
      getInputProps,
      getRootProps,
      setOpen: handleSetOpen,
      setGetInputProps: handleSetGetInputProps,
      setGetRootProps: handleSetGetRootProps,
    }),
    [
      open,
      getInputProps,
      getRootProps,
      handleSetOpen,
      handleSetGetInputProps,
      handleSetGetRootProps,
    ],
  );

  return (
    <DropzoneContext.Provider value={value}>
      {children}
    </DropzoneContext.Provider>
  );
};
