import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileDownloadOffOutlinedIcon from '@mui/icons-material/FileDownloadOffOutlined';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useEffect, useMemo, useState} from 'react';
import {ContractView} from 'models/contract';
import {MenuAction} from 'models/action';
import {useTranslation} from 'react-i18next';
import TableActionMenu from 'components/Table/TableActionMenu';

interface Props {
  contract: ContractView;
}

const NewActions = ({contract}: Props) => {
  const {t} = useTranslation();

  const [open, setOpen] = useState(false);
  const [shouldDownload, setShouldDownload] = useState(false); // quick fix solution, change using implementation from  MT-5859

  const url = contract?.additionalInfo?.documents?.[0]?.uri || '';
  const fileName =
    contract?.additionalInfo?.documents?.[0]?.description || 'contract';

  const {data: downloadUrl, refetch: downloadDocument} = useDownloadUrl(
    url ? [url] : [],
    {enabled: false},
  );

  const handleDownload = async (urlRecord: {[p: string]: string}) => {
    const uploadUrl = Object.values(urlRecord)[0];
    const response = await fetch(uploadUrl);
    const file = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.setAttribute('download', fileName);
    link.click();
  };

  useEffect(() => {
    if (shouldDownload && downloadUrl && Object.values(downloadUrl).length) {
      handleDownload(downloadUrl).then(() => {
        setShouldDownload(false);
      });
    }
  }, [downloadUrl, shouldDownload]);

  const actions = useMemo(() => {
    const items: MenuAction[] = [];

    if (url) {
      items.push({
        label: t('Download'),
        icon: <FileDownloadOutlinedIcon />,
        onClick: async () => {
          await downloadDocument();
          setShouldDownload(true);
        },
      });
    } else {
      items.push({
        label: t('Download'),
        icon: <FileDownloadOffOutlinedIcon />,
        onClick: () => {},
        disabled: true,
      });
    }

    return items;
  }, [t]);

  return <TableActionMenu options={actions} isOpen={open} onToggle={setOpen} />;
};

export default NewActions;
