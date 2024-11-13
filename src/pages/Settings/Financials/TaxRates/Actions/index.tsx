import {useEffect, useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import {
  DeleteOutline,
  EditOutlined,
  PushPinOutlined,
} from '@mui/icons-material';
import {Action} from 'models/table';
import TableActionMenu from 'components/Table/TableActionMenu';
import {Confirm} from 'components/Confirm';
import {useDeleteVat, useUpdateVat} from 'hooks/reactQuery/useVats';
import {Trans} from 'react-i18next';
import {VatView} from 'models/vat';
import {Dialog} from 'components/Dialog';
import {theme} from 'theme';
import {TaxRatesModal} from '../TaxRatesModal';

type Props = {
  taxRate: VatView;
};

const Actions = ({taxRate}: Props) => {
  const {mutate: updateTaxRate} = useUpdateVat();
  const {mutate: deleteTaxRate} = useDeleteVat();
  const [openActionMenu, setOpenActionMenu] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const form = useForm<VatView>({
    mode: 'all',
    defaultValues: {
      id: taxRate.id,
      name: taxRate.name,
      percentage: taxRate.percentage || 0,
      legalNote: taxRate.legalNote,
      isDefault: taxRate.isDefault || false,
    },
  });

  useEffect(() => {
    form.reset({
      id: taxRate.id,
      name: taxRate.name,
      percentage: taxRate.percentage || 0,
      legalNote: taxRate.legalNote,
      isDefault: taxRate.isDefault || false,
    });
  }, []);

  const onCancel = () => {
    setOpenEditDialog(false);
  };

  const onDelete = () => {
    setOpenActionMenu(false);
    setOpenConfirmDialog(true);
  };

  const handleDelete = () => {
    deleteTaxRate(taxRate?.id || '', {
      onSuccess: () => {
        setOpenConfirmDialog(false);
      },
    });
  };

  const handleSave = (data: VatView) => {
    updateTaxRate(data, {
      onSuccess: () => {
        setOpenEditDialog(false);
      },
    });
  };

  const OPTIONS = useRef<Action[]>([
    {
      icon: PushPinOutlined,
      label: 'Set as default',
      onTrigger: () => {
        setOpenActionMenu(false);
        handleSave({...taxRate, isDefault: true});
      },
    },
    {
      icon: EditOutlined,
      label: 'Edit',
      onTrigger: () => {
        setOpenActionMenu(false);
        setOpenEditDialog(true);
      },
    },
    {
      icon: DeleteOutline,
      label: 'Delete',
      onTrigger: onDelete,
    },
  ]);

  return (
    <>
      <TableActionMenu
        options={OPTIONS.current}
        isOpen={openActionMenu}
        onToggle={setOpenActionMenu}
      />
      <Dialog
        title="Edit tax rate"
        onCancel={onCancel}
        onSave={form.handleSubmit(handleSave)}
        saveButtonText="Save tax rate"
        saveButtonContainerStyles={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
        }}
        cancelButtonVariant="outlined"
        cancelButtonStyles={{
          border: `1px solid ${theme.palette.primary.dark}`,
        }}
        cancelButtonTextColor={theme.palette.primary.dark}
        disableSaveBtn={!form.formState.isValid}
        dialogProps={{
          maxWidth: 'sm',
          open: openEditDialog || false,
        }}>
        <TaxRatesModal form={form} />
      </Dialog>
      <Confirm
        maxWidth={410}
        open={openConfirmDialog}
        onConfirm={handleDelete}
        onClose={() => setOpenConfirmDialog(false)}
        title="Remove tax rate"
        content={
          <Trans
            defaults="You are about to remove <bold>{{taxRateName}}</bold> tax rate."
            values={{taxRateName: taxRate.name}}
            components={{bold: <strong />}}
          />
        }
        secondContent="Are you sure about it?"
        closeBtnLabel="Cancel"
        confirmBtnLabel="Remove tax rate"
      />
    </>
  );
};

export default Actions;
