import {SearchOutlined} from '@mui/icons-material';
import {InputAdornment} from '@mui/material';
import {Box} from '@mui/system';
import {Button} from 'components/Button';
import {FormInput} from 'components/form/FormInput';
import AddIcon from '@mui/icons-material/Add';
import {ChangeEvent, useRef} from 'react';
import {ElevatorDataSchemaView} from 'models/elevator';
import {Resource} from 'models/misc';
import {Page} from 'models/pagination';
import TechnicalDataTable from './TechnicalDataTable';

interface Props {
  onOpenAddDialog: () => void;
  dataResource?: Resource<ElevatorDataSchemaView>;
  page: Page;
  setPage: (value: Page) => void;
  onOpenEditDialog: (item: ElevatorDataSchemaView) => void;
  onOpenDeleteDialog: (item: ElevatorDataSchemaView) => void;
  onOpenPreviewDialog: (item: ElevatorDataSchemaView) => void;
  onDuplicate: (item: ElevatorDataSchemaView) => void;
  onSearchTextChange: (event: ChangeEvent<HTMLInputElement>) => void;
  searchQuery?: string;
}

const TechnicalDataFilledView = ({
  page,
  setPage,
  dataResource,
  onOpenAddDialog,
  onOpenEditDialog,
  onOpenDeleteDialog,
  onOpenPreviewDialog,
  onDuplicate,
  onSearchTextChange,
  searchQuery = '',
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePageIndexChange = (value: number) => {
    setPage({...page, pageIndex: value});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleChangeElementsPerPage = (value: number) => {
    setPage({...page, pageSize: value, pageIndex: 0});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          mt: 1,
          mb: 2,
        }}>
        <FormInput
          containerStyles={{
            '& .MuiInputBase-root': {
              height: 40,
              flex: 1,
              maxWidth: 300,
            },
          }}
          fieldProps={{
            size: 'small',
            onChange: onSearchTextChange,
            placeholder: 'Search',
            value: searchQuery,
            required: true,
            slotProps: {
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                ),
              },
            },
          }}
        />
        <Button
          buttonProps={{startIcon: <AddIcon />, onClick: onOpenAddDialog}}
          enableRipple
          variant="contained"
          style={{width: 250}}
          label="New Technical Data"
        />
      </Box>
      <TechnicalDataTable
        onPageIndexChange={handlePageIndexChange}
        onChangeElementsPerPage={handleChangeElementsPerPage}
        dataResource={dataResource}
        onOpenEditDialog={onOpenEditDialog}
        onDuplicate={onDuplicate}
        onOpenDeleteDialog={onOpenDeleteDialog}
        onOpenPreviewDialog={onOpenPreviewDialog}
      />
    </>
  );
};

export default TechnicalDataFilledView;
