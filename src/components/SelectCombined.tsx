import {ReactNode, useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {FormLabel} from './form/FormLabel';
import {SelectCard} from './SelectCard';
import {SelectButton} from './SelectButton';
import {SelectModal} from './SelectModal';

interface Props {
  label: string;
  labelRequired?: boolean;
  selected: boolean;
  buttonText: string;
  cardHeader: ReactNode;
  cardBody?: ReactNode;
  cardOnClose?: () => void;
  modalHeader: string;
  modalBody: ReactNode;
}

export const SelectCombined = ({
  label,
  labelRequired,
  selected,
  buttonText,
  cardHeader,
  cardBody,
  cardOnClose,
  modalHeader,
  modalBody,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (selected) setIsModalOpen(false);
  }, [selected]);

  return (
    <Box>
      <FormLabel text={label} required={labelRequired} />

      {selected ? (
        <SelectCard header={cardHeader} body={cardBody} onClose={cardOnClose} />
      ) : (
        <SelectButton text={buttonText} onClick={() => setIsModalOpen(true)} />
      )}
      <SelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        header={modalHeader}>
        {modalBody}
      </SelectModal>
    </Box>
  );
};
