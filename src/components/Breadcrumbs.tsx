import {useState} from 'react';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Box from '@mui/material/Box';

interface LinkProp {
  label?: string;
  action?: () => void;
  path?: string;
}

interface Props {
  links: LinkProp[];
  activeIndex?: number;
}

export const BreadCrumbs = ({links, activeIndex = 0}: Props) => {
  const [selected, setSelected] = useState(activeIndex);
  return (
    <Box>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb">
        {links.map((link, index) =>
          index !== selected ? (
            <Typography
              key={index}
              sx={{
                '&:hover': {
                  textDecoration: selected !== index ? 'underline' : 'none',
                },
              }}
              onClick={() => {
                setSelected(index);
                if (link?.action) {
                  link.action();
                }
              }}>
              {link.label || ''}
            </Typography>
          ) : (
            <Typography key={index} color="text.primary">
              {link.label || ''}
            </Typography>
          ),
        )}
      </MuiBreadcrumbs>
    </Box>
  );
};
