import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';

interface Props {
  options: string[];
  selectedOption: string;
  onSelectedOptionChanged: (option: string) => void;
  variant?: 'text' | 'contained' | 'outlined' | undefined;
  selectionStyle?: {[key: string]: string | number};
  disableRipple?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const SplitButton = ({
  options,
  selectedOption,
  onSelectedOptionChanged,
  variant,
  selectionStyle,
  disableRipple,
  size,
}: Props) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);

  const handleClick = () => {};

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    option: string,
  ) => {
    onSelectedOptionChanged(option);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <React.Fragment>
      <ButtonGroup
        variant={variant || 'contained'}
        ref={anchorRef}
        aria-label="split button"
        size={size || 'medium'}
      >
        <Button
          disableRipple={disableRipple}
          onClick={handleClick}
          sx={{...(selectionStyle || null)}}
        >
          <Typography sx={{textTransform: 'capitalize'}}>
            {' '}
            {selectedOption}
          </Typography>
        </Button>
        <Button
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({TransitionProps, placement}) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu">
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={options[index] === selectedOption}
                      onClick={(event) =>
                        handleMenuItemClick(event, options[index])
                      }
                    >
                      <Typography sx={{textTransform: 'capitalize'}}>
                        {' '}
                        {option}
                      </Typography>
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
};
