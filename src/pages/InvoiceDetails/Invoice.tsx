import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import {Document, Page, pdfjs} from 'react-pdf/dist/esm/entry.webpack';
import Typography from '@mui/material/Typography';

// https://github.com/wojtekmaj/react-pdf/issues/321#issuecomment-451291757
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const fileUrl =
  'https://media-bucket-stage-505a42c.s3.eu-central-1.amazonaws.com/4a156124-a1f1-4877-9059-595416996223/invoices/62a0e86d-ecee-4139-b977-48ff529187f7.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIASIIIXQUADMNOV34V%2F20220210%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20220210T151022Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDGV1LWNlbnRyYWwtMSJIMEYCIQDeSI7DmnibT2Hk78OOMuAwSRMZrTz%2FydbGncwBLTtjzgIhAOYAJrY54GN3TZAkKFoOPYrTAnC1tVdbEOA9Fyolmjf8KqYCCDAQAhoMMTU1MTc0MDEyMTYwIgzZBR21rzgLQF%2Beg6wqgwIGqF%2B8z6NCp%2BP5JdEhxfnQ4rbpYxOF2tevvH4jv7gIShTu0gU%2BOCP9KpxRhRw0XSJtHEmDBptaGFw2lrw%2B%2FN5JwVVbFhLsfcXmTNDGXWDoYECd2JZSBh8c74m%2FknOc8By13B7%2BLBgMNCI3mxU67ag2FHGpdPXtdxmFzOPsUIOixLlsJf7SgYhfdRBpYBfr7BjgM6rFwKuIWDFN3avxQD9f1rGhv4Wg%2BMT4fIMze4bAQVDt9TOp%2FQsfBOinl5SqLrOX24cvP1Xj%2Bn%2BhZQHj4BZuBqMWaAnNayP4z2YZUuBXz66JLhviBU%2BPZWllmE48Fwo596Fo5qg33kaZHyR0PPNyYy7XMNnVlJAGOpkBmd2xEs%2B9aGBBNFPSBf7xUvZJScLyMCpYURTHedkMzpcBIcy4z25J3WBhnLvr%2BDqS%2F7aOgCE1QSvjzW4IkDqT67jfv%2Bi6Tq4eardIZF%2BpoPThJ4wOSJUGSMDnFuNWsOaivBY5R9CHGXODQDm6WyXnfetDO%2FvmQ2v30I2Z96najU5NCwo%2BNTzgqW7JMW%2FetddR3ToZljMNFOVl&X-Amz-Signature=41428868e654f19d1d4e396debc52d0bc5ddf9dd9c364db225ee2cf8df7cd422&X-Amz-SignedHeaders=host';

interface Props {
  containerStyle?: {[key: string]: string | number};
  // TODO: Resolve null type here
  downloadUrl?: string | null;
}

export const Invoice = ({containerStyle, downloadUrl}: Props) => {
  const theme = useTheme();
  return (
    <Box display="flex" justifyContent="center">
      <Box
        sx={{
          backgroundColor: theme.palette.inputBackground.main,
          p: '1em',
          width: '44vw',
          ...containerStyle,
        }}
      >
        <Box width="100%">
          <Document file={downloadUrl}>
            <Page renderTextLayer={false} pageNumber={1} />
          </Document>
        </Box>
      </Box>
    </Box>
  );
};
