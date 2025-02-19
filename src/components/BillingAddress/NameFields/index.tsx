import Alert from 'components/Alert';
import Box from '@mui/material/Box';
import {FormInput} from 'components/form/FormInput';
import IconButton from '@mui/material/IconButton';
import Close from '@mui/icons-material/Close';
import MuiButton from '@mui/material/Button';
import React, {useCallback, useState} from 'react';
import useTheme from '@mui/material/styles/useTheme';
import {useTranslation} from 'react-i18next';
import {ReactComponent as AlertInfoIcon} from 'assets/icons/AlertInfo.svg';

type Props = {
  name?: string | null;
  name2?: string | null;
  name3?: string | null;
  fieldWidth?: string;
  setName: (name: string | null) => void;
  setName2: (name2: string | null) => void;
  setName3: (name3: string | null) => void;
  onBlur?: (e: React.FocusEvent) => void;
};

const NameFields = ({
  name,
  name2,
  name3,
  fieldWidth = '20%',
  setName,
  setName2,
  setName3,
  onBlur,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const [showSecondName, setShowSecondName] = useState(!!name2 || false);

  const [showThirdName, setShowThirdName] = useState(!!name3 || false);

  const defaultProps = {
    InputLabelProps: {shrink: true},
    onBlur,
  };

  const handleRemoveNameField = useCallback(() => {
    if (showThirdName) {
      setName3(null);
      setShowThirdName(false);
    } else {
      setName2(null);
      setShowSecondName(false);
    }
  }, [showSecondName, showThirdName]);

  const handleAddNameField = useCallback(() => {
    if (!showSecondName) {
      setName2(null);
      setShowSecondName(true);
    } else {
      setName3(null);
      setShowThirdName(true);
    }
  }, [showSecondName, showThirdName]);

  return (
    <>
      <Alert
        Icon={
          <AlertInfoIcon
            style={{
              width: '22px',
              height: '22px',
              color: theme.palette.info.main,
            }}
            fill={theme.palette.info.infoAlert}
          />
        }
        textKey="Additional names will be added underneath the main name on pdf documents."
        sx={{
          background: theme.palette.info.infoAlert,
          color: theme.palette.text.primary,
        }}
      />

      <Box sx={{display: 'flex', alignItems: 'center', width: '100%'}}>
        <Box sx={{display: 'flex', width: fieldWidth}}>
          <FormInput
            fieldProps={{
              size: 'small',
              label: 'Name',
              name: 'billingAddress.component.name',
              value: name ?? '',
              onChange: (event) => {
                setName(event.target.value);
              },
              ...defaultProps,
            }}
          />
        </Box>

        {showSecondName && (
          <Box
            sx={{
              display: 'flex',
              width: fieldWidth,
              marginLeft: theme.spacing(3),
            }}>
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'Name 2',
                name: 'billingAddress.component.name2',
                value: name2 ?? '',
                onChange: (event) => {
                  setName2(event.target.value);
                },
                ...defaultProps,
              }}
            />
          </Box>
        )}

        {showThirdName && (
          <Box
            sx={{
              display: 'flex',
              width: fieldWidth,
              marginLeft: theme.spacing(3),
            }}>
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'Name 3',
                name: 'billingAddress.component.name3',
                value: name3 ?? '',
                onChange: (event) => {
                  setName3(event.target.value);
                },
                ...defaultProps,
              }}
            />
          </Box>
        )}
        {showSecondName && (
          <IconButton
            disableRipple
            disableFocusRipple
            disableTouchRipple
            sx={{display: 'flex', marginLeft: theme.spacing(1.5)}}
            onClick={handleRemoveNameField}>
            <Close />
          </IconButton>
        )}

        {!showThirdName && (
          <MuiButton
            variant="text"
            disableRipple
            disableFocusRipple
            disableTouchRipple
            style={{
              display: 'flex',
              color: theme.palette.primary.light,
              marginLeft: theme.spacing(3),
            }}
            onClick={handleAddNameField}
            data-testid="add-additional-name">{`+ ${t(
            'Additional Name',
          )}`}</MuiButton>
        )}
      </Box>
    </>
  );
};

export default NameFields;
