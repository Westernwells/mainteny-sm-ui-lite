import {PropsWithChildren, ReactElement, ReactNode} from 'react';
import {Avatar} from 'components/Avatar';
import {UserAccount, UserAccountView} from 'models/user';
import {Box, Tooltip, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {getUserFullName} from 'utils/utils';
import {useTheme} from '@mui/system';

type Props = {
  employees: UserAccountView[] | UserAccount[];
};

type WrapperProps = Pick<Props, 'employees'>;

const TooltipWrapper = ({
  employees,
  children,
}: PropsWithChildren<WrapperProps>) => {
  const {t} = useTranslation();
  const theme = useTheme();
  if (employees.length <= 1) return children;

  return (
    <Tooltip
      title={
        <Box
          sx={{display: 'flex', flexDirection: 'column'}}
          gap={theme.spacing(0.5)}>
          <Typography
            sx={{
              color: '#BDBDBD',
              lineHeight: '14px',
              fontSize: '10px',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
            }}>{`${employees.length} ${t('ENGINEERS')}`}</Typography>
          {employees.map((employee) => {
            const name = getUserFullName(employee);
            return (
              <Typography
                key={`avatar-tooltip-name-${employee.id}`}
                sx={{
                  lineHeight: '14px',
                  fontSize: '10px',
                }}>
                {name}
              </Typography>
            );
          })}
        </Box>
      }
      arrow
      placement="top"
      sx={{padding: '4px, 8px'}}>
      {/* Casting to remove ReactNode to ReactElement ts error */}
      {children as ReactElement<ReactNode>}
    </Tooltip>
  );
};

const AvatarGroup = ({employees}: Props) => (
  <div>
    <TooltipWrapper employees={employees}>
      <Box sx={{display: 'flex'}} gap={1}>
        {employees.map((employee) => (
          <Avatar key={`avatar-group-${employee.id}`} userAccount={employee} />
        ))}
      </Box>
    </TooltipWrapper>
  </div>
);

export default AvatarGroup;
