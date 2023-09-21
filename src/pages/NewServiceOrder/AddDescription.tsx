import {grey} from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import {FormInput} from 'components/form/FormInput';
import {PageCard} from 'components/PageCard';
import {ElevatorView} from 'models/elevator';
import {EmployeesView} from 'models/employee';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Summary, SummaryItem} from './Summary';
import {RadioOptions} from './models';

interface Props {
  getDescription?: (val: string) => void;
  initialDescription?: string;
  selectedUnit?: ElevatorView;
  selectedTechnicians?: EmployeesView[];
  selectedDateString?: string;
  selectedTimeString?: string;
  selectedRadioOption?: string;
}

export const AddDescription = ({
  getDescription,
  initialDescription = '',
  selectedUnit,
  selectedTechnicians = [],
  selectedDateString,
  selectedTimeString,
  selectedRadioOption,
}: Props) => {
  const {t} = useTranslation();
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    if (getDescription) {
      getDescription(description);
    }
  }, [description]);

  return (
    <>
      <Typography variant="h6" pb={2}>
        {t('Description')}
      </Typography>

      {selectedUnit ? (
        <Summary label="Selected Unit">
          <SummaryItem value={selectedUnit.model} />
        </Summary>
      ) : null}

      {selectedTechnicians.length ? (
        <Summary label="Selected Technician" containerStyle={{mt: '1em'}}>
          {selectedTechnicians.map((item) => (
            <SummaryItem
              key={item.id}
              value={`${item.userAccount.firstName} ${item.userAccount.lastName}`}
            />
          ))}
        </Summary>
      ) : null}

      {(selectedDateString || selectedTimeString) &&
      selectedRadioOption !== RadioOptions.IMMEDIATE ? (
        <Summary label="Selected Date & Time" containerStyle={{mt: '1em'}}>
          {selectedDateString ? (
            <SummaryItem
              value={`${selectedDateString} ${
                selectedTimeString ? ` at ${selectedTimeString}` : ''
              }`}
              containerStyle={{display: 'inline-block'}}
            />
          ) : null}
        </Summary>
      ) : null}

      <PageCard
        customHeader={
          <Typography variant="subtitle2" color="grey.700">
            {t('Description (Optional)')}
          </Typography>
        }
        containerStyles={{mt: '2em'}}>
        <FormInput
          props={{
            sx: {background: grey[50], border: 'none'},
            value: description,
            multiline: true,
            maxRows: 8,
            placeholder: t('Please describe what happened'),
            size: 'medium',
            fullWidth: true,
            type: 'text',
            onChange: (e) => setDescription(e.target.value),
          }}
        />
      </PageCard>
    </>
  );
};
