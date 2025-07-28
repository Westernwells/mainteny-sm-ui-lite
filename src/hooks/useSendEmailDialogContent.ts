import {useState, useEffect} from 'react';

export function useSendEmailDialogContent(
  isOpen: boolean,
  initialText: string,
): [string] {
  const [body, setBody] = useState('');

  useEffect(() => {
    // only re-initialize when the dialog is closed
    if (!isOpen) {
      setBody(`${initialText}\n`);
    }
  }, [isOpen, initialText]);

  return [body];
}
