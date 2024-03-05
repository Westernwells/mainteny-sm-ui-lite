import React from 'react';
import {useNavigate} from 'react-router';
import Typography from '@mui/material/Typography';
import MUITooltip, {TooltipProps} from '@mui/material/Tooltip';

interface Props {
  model: any;
  modelPath: string;
}

export const NavigateToDetails = ({model, modelPath}: Props) => {
  const navigate = useNavigate();
  return model?.externalId ? (
    <Typography
      variant="subtitle1"
      onClick={() => navigate(`/${modelPath}/details/${model.id}`)}
      sx={{
        color: 'primary.light',
        cursor: 'pointer',
      }}>
      {model.externalId !== '' ? model.externalId : 'Unassigned'}
    </Typography>
  ) : (
    <Typography variant="subtitle1">
      {model?.externalId !== '' ? model?.externalId : 'Unassigned'}
    </Typography>
  );
};

export const Tooltip = ({children, ...props}: TooltipProps) => (
  <MUITooltip
    PopperProps={{
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, -10],
          },
        },
      ],
    }}
    {...props}>
    {children}
  </MUITooltip>
);
