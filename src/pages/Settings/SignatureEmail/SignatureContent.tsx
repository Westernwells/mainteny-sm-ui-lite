import {Box, Grid2 as Grid} from '@mui/material';
import TableActionMenu from 'components/Table/TableActionMenu';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import Edit from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {EmailSignature} from 'models/employee';
import DOMPurify from 'dompurify';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useUserSession} from 'hooks/reactQuery/useUserSession';

type Props = {
  hasActionMenu?: boolean;
  previewHtml?: string;
  logoSrc?: string;
  employeeSignature?: EmailSignature;
  onPreview?: (item: EmailSignature) => void;
  onEdit?: (item: EmailSignature) => void;
  onDelete?: (item: EmailSignature) => void;
};

const SignatureContent = ({
  hasActionMenu,
  onPreview,
  onEdit,
  onDelete,
  previewHtml,
  logoSrc,
  employeeSignature,
}: Props) => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;
  const {data: logoUrl = {}} = useDownloadUrl(
    employeeSignature?.content.images || [],
    undefined,
    serviceCompanyId,
  );

  const OPTIONS = [
    {
      icon: <RemoveRedEye sx={{color: 'text.secondary'}} />,
      label: 'Preview',
      onClick: () => onPreview!(employeeSignature!),
    },
    {
      icon: <Edit sx={{color: 'text.secondary'}} />,
      label: 'Edit',
      onClick: () => onEdit!(employeeSignature!),
    },
    {
      icon: <DeleteIcon sx={{color: 'text.secondary'}} />,
      label: 'Delete',
      onClick: () => onDelete!(employeeSignature!),
    },
  ];

  return (
    <Grid
      container
      spacing={2}
      alignItems="flex-start"
      direction="row"
      justifyContent="space-between"
      display="flex">
      <Grid direction="row" justifyContent="space-between" display="flex">
        {(employeeSignature?.content.images[0] || logoSrc) && (
          <Grid sx={{mr: 4}}>
            <Box display="flex" alignItems="center" gap={1}>
              <img
                src={logoUrl[employeeSignature?.content.images[0]!] || logoSrc}
                width={88}
                style={{borderRadius: '50%', objectFit: 'cover'}}
                height={88}
                alt={employeeSignature?.content.images[0] || logoSrc}
                loading="lazy"
              />
            </Box>
          </Grid>
        )}

        <Grid direction="column">
          <Box
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                employeeSignature?.content.html || previewHtml!,
              ),
            }}
            sx={{
              margin: '0em',
              padding: '0em',
              '& p': {
                marginBottom: '0em',
                lineHeight: '0.6em',
              },
              '& a': {
                color: '#0092B2 !important',
                textDecoration: 'underline',
              },
            }}
          />
        </Grid>
      </Grid>

      {hasActionMenu && (
        <Grid>
          <TableActionMenu options={OPTIONS} />
        </Grid>
      )}
    </Grid>
  );
};

export default SignatureContent;
