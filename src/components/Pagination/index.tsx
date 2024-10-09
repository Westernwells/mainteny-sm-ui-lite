import {Button, MenuItem, Radio} from '@mui/material';
import {Box} from '@mui/system';
import {useTranslation} from 'react-i18next';
import {Fragment, useMemo, useRef, useState} from 'react';
import Menu from '@mui/material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Typography from '@mui/material/Typography';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import {ELEMENTS_PER_PAGE_OPTIONS, PageDetails} from '../../models/pagination';
import PageButton from './PageButton';
import {getDotsSide, removePageIndex} from '../../utils/paging';

type Props = {
  currentIndex: number;
  totalPages: number;
  numberOfElementsPerPage: number;
  totalEntries: number;
  onChange: (page: number) => void;
  onNumberPerPageChange: (page: number) => void;
};

const Pagination = ({
  currentIndex,
  totalPages,
  numberOfElementsPerPage,
  totalEntries,
  onChange,
  onNumberPerPageChange,
}: Props) => {
  const {t} = useTranslation();
  const anchorEl = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const handleToggleNumberPerPageMenu = (value: boolean) => () => {
    setOpen(value);
  };

  const handleTotalNumberPerPageChange = (value: number) => () => {
    onNumberPerPageChange(value);
    setOpen(false);
  };

  const [startIndexForPage, endIndexForPage] = useMemo(() => {
    const start = currentIndex * numberOfElementsPerPage + 1;
    const endRoundUpFromPage = (currentIndex + 1) * numberOfElementsPerPage;
    const end =
      endRoundUpFromPage <= totalEntries ? endRoundUpFromPage : totalEntries;
    return [start, end];
  }, [currentIndex, numberOfElementsPerPage, totalEntries]);

  const pagesToShow: PageDetails[] | null = useMemo(() => {
    if (totalPages === 1) return null;
    return [...Array(totalPages)].reduce((acc, _, index, array) => {
      // Remove pages
      if (removePageIndex(index, currentIndex, array.length - 1)) return acc;
      const element: PageDetails = {
        value: index + 1,
        index,
        isSelected: index === currentIndex,
        hasDots: getDotsSide(index, currentIndex, array.length - 1),
      };
      return [...acc, element];
    }, []);
  }, [currentIndex, totalPages]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <Box sx={{display: 'flex', alignItems: 'center'}} gap={2}>
        {t('Show rows per page')}
        <Button
          ref={anchorEl}
          sx={{
            height: '32px',
            padding: '0px',
            minHeight: '32px',
          }}
          id="page-size-menu-button"
          variant="outlined"
          disableElevation
          onClick={handleToggleNumberPerPageMenu(true)}
          startIcon={<ArrowDropDownIcon />}>
          {numberOfElementsPerPage}
        </Button>

        <Menu
          open={open}
          anchorEl={anchorEl.current}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          onClose={handleToggleNumberPerPageMenu(false)}>
          <>
            {ELEMENTS_PER_PAGE_OPTIONS.map((option) => {
              const isSelected = numberOfElementsPerPage === option;

              return (
                <MenuItem
                  key={`element-per-page-selector-option-${option}`}
                  onClick={handleTotalNumberPerPageChange(option)}>
                  <Radio checked={isSelected} value={option} disableRipple />
                  <Typography>{option}</Typography>
                </MenuItem>
              );
            })}
          </>
        </Menu>
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center'}} gap={2}>
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <Typography variant="subtitle2">
            {startIndexForPage} - {endIndexForPage} &nbsp;
          </Typography>
          <Typography variant="body2">
            {t(`of {{totalEntries}} results`, {
              startPageElementNumber: startIndexForPage,
              endPageElementNumber: endIndexForPage,
              totalEntries,
            })}
          </Typography>
        </Box>
        {pagesToShow && (
          <Box sx={{display: 'flex', alignItems: 'center'}} gap={1}>
            <PageButton
              key="page-button-left"
              disabled={currentIndex === 0}
              onClick={() => onChange(currentIndex - 1)}>
              <KeyboardArrowLeftIcon />
            </PageButton>
            {pagesToShow.map(
              ({value, index, isSelected, hasDots}, arrayIndex, array) => {
                // remove double stacking dots
                const isPreviousElementWIthRightDots =
                  arrayIndex + 1 < array.length &&
                  array[arrayIndex + 1].hasDots === 'right';
                return (
                  <Fragment key={`page-button-fragment-${index}`}>
                    {!isPreviousElementWIthRightDots && hasDots === 'left' && (
                      <PageButton key="page-button-left-dont" disabled>
                        <MoreHorizOutlinedIcon />
                      </PageButton>
                    )}
                    <PageButton
                      key={`page-button-${value}`}
                      disabled={isSelected}
                      onClick={() => index !== null && onChange(index)}
                      isSelected={isSelected}>
                      {value}
                    </PageButton>
                    {hasDots === 'right' && (
                      <PageButton key="page-button-right-dots" disabled>
                        <MoreHorizOutlinedIcon />
                      </PageButton>
                    )}
                  </Fragment>
                );
              },
            )}
            <PageButton
              key="page-button-right"
              disabled={currentIndex === totalPages - 1}
              onClick={() => onChange(currentIndex + 1)}>
              <KeyboardArrowRightIcon />{' '}
            </PageButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Pagination;
