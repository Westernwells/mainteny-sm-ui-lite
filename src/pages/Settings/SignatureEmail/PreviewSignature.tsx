import {Grid2 as Grid} from '@mui/material';
import {CardAlert} from 'components/CardAlert';
import {ReactComponent as AlertInfoIcon} from 'assets/icons/AlertInfo.svg';
import {ReactComponent as SignatureLoader} from 'assets/images/SignatureLoader.svg';
import {EmailSignature} from 'models/employee';
import SignatureContent from './SignatureContent';

type Props = {
  previewHtml?: string;
  logoSrc?: string;
  employeeSignature?: EmailSignature;
};

const PreviewSignature = ({previewHtml, logoSrc, employeeSignature}: Props) => (
  <Grid>
    <CardAlert
      alertIcon={<AlertInfoIcon />}
      message="Email layout example with your signature appended."
      status="info"
    />

    <Grid sx={{pt: 5, pb: 4}}>
      <SignatureLoader width="100%" height="100%" />
    </Grid>

    <SignatureContent
      hasActionMenu={false}
      employeeSignature={employeeSignature}
      previewHtml={previewHtml}
      logoSrc={logoSrc}
    />
  </Grid>
);

export default PreviewSignature;
