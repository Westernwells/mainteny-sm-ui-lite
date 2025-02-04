import React, {useState, useMemo, Fragment} from 'react';
import {
  Box,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import DOMPurify from 'dompurify';
import {currencyFormatting, useCurrentCurrency} from 'utils/currency';
import {ArticleSubAssociationView, MixedPositionRow} from 'models/article';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import PreviewFrame from 'assets/images/PreviewFrame.svg';
import PreviewFrameTwo from 'assets/images/PreviewFrame2.svg';
import PreviewFrameThree from 'assets/images/PreviewFrame3.svg';
import PreviewFrameFour from 'assets/images/PreviewFrame4.svg';
import {
  defaultCellStyles,
  defaultHeaderStyles,
  bodyStyles,
  defaultFooterCellStyles,
  footerBodyTagStyles,
  footerBodyContentStyles,
  zoomButtonStyles,
} from './MixedPosition.styles';

const ZOOM_LIMITS = {min: 50, max: 200, step: 10};

interface HeaderColumn {
  label: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

const PlaceholderImage = ({
  src,
  alt,
  top,
}: {
  src: string;
  alt: string;
  top: number;
}) => (
  <Box
    sx={{
      margin: '1em',
      width: '566px',
      textAlign: 'left',
      position: 'sticky',
      top,
      zIndex: 1,
      display: 'flex',
      justifyContent: 'flex-start',
    }}>
    <img alt={alt} src={src} style={{maxWidth: '100%'}} />
  </Box>
);

const PositionPreview = ({
  mixedPosition,
  subPositions,
}: {
  mixedPosition: MixedPositionRow | null;
  subPositions: ArticleSubAssociationView[] | null;
}) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);
  const currentCurrency = useCurrentCurrency();
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleZoomIn = () =>
    setZoomLevel((prev) => Math.min(prev + ZOOM_LIMITS.step, ZOOM_LIMITS.max));
  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(prev - ZOOM_LIMITS.step, ZOOM_LIMITS.min));

  const headerColumns: HeaderColumn[] = [
    {label: '#'},
    {label: t('Name')},
    {label: t('Quantity'), align: 'right'},
    {label: t('Unit')},
    {label: t('Price'), align: 'right'},
    {label: t('Discount'), align: 'right'},
    {
      label: `${t('Total')}(${currentCurrency.symbol})`,
      align: 'right',
      width: '94px',
    },
  ];

  const renderSubRowHeader = () => (
    <TableRow>
      {headerColumns.map((col, index) => (
        <TableCell
          key={index}
          sx={{
            ...defaultCellStyles,
            textAlign: col.align || 'left',
            ...(col.width ? {width: col.width} : {}),
          }}>
          <Typography sx={defaultHeaderStyles}>{col.label}</Typography>
        </TableCell>
      ))}
    </TableRow>
  );

  const renderTableRows = useMemo(
    () => (
      <>
        <TableRow>
          <TableCell sx={defaultCellStyles}>
            <Typography sx={bodyStyles}>1</Typography>
          </TableCell>
          <TableCell sx={defaultCellStyles}>
            <Typography
              sx={bodyStyles}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(mixedPosition?.data.name || ''),
              }}
            />
          </TableCell>
          <TableCell sx={{...defaultCellStyles, textAlign: 'right'}}>
            <Typography sx={bodyStyles} textAlign="right">
              {mixedPosition?.quantity || '-'}
            </Typography>
          </TableCell>
          <TableCell sx={defaultCellStyles}>
            <Typography sx={bodyStyles}>
              {t(mixedPosition?.data.unit || '-')}
            </Typography>
          </TableCell>
          <TableCell sx={{...defaultCellStyles, textAlign: 'right'}}>
            <Typography sx={bodyStyles}>
              {currencyFormatting(
                mixedPosition?.data.unitSellingAmount?.netAmount || 0,
                currentCurrency,
                company?.language,
              )}
            </Typography>
          </TableCell>
          <TableCell sx={{...defaultCellStyles, textAlign: 'right'}}>
            <Typography sx={bodyStyles}>-</Typography>
          </TableCell>
          <TableCell
            sx={{...defaultCellStyles, textAlign: 'right', width: '94px'}}>
            <Typography sx={bodyStyles}>
              {currencyFormatting(
                mixedPosition?.data.unitSellingAmount?.netAmount || 0,
                currentCurrency,
                company?.language,
              )}
            </Typography>
          </TableCell>
        </TableRow>

        {/* Description row */}
        <TableRow>
          <TableCell colSpan={1} sx={defaultCellStyles} />
          <TableCell colSpan={5} sx={defaultCellStyles}>
            <Typography
              sx={{...bodyStyles, width: '100%'}}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  mixedPosition?.data.description || '',
                ),
              }}
            />
          </TableCell>
        </TableRow>
      </>
    ),
    [mixedPosition, currentCurrency, t],
  );

  const renderSubPositionRows = useMemo(
    () =>
      subPositions?.map((subPosition, index) => (
        <Fragment key={index}>
          <TableRow>
            <TableCell sx={defaultCellStyles}>
              <Typography sx={bodyStyles}>{`1.${
                Number(subPosition?.seqNumber ?? 0) + 1
              }`}</Typography>
            </TableCell>
            <TableCell sx={defaultCellStyles}>
              <Typography
                sx={bodyStyles}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(subPosition.article.name || ''),
                }}
              />
            </TableCell>
            <TableCell sx={{...defaultCellStyles, textAlign: 'right'}}>
              <Typography sx={bodyStyles} textAlign="right">
                {subPosition.quantity || '-'}
              </Typography>
            </TableCell>
            <TableCell sx={defaultCellStyles}>
              <Typography sx={bodyStyles}>
                {t(subPosition.article.unit!)}
              </Typography>
            </TableCell>
            <TableCell sx={{...defaultCellStyles, textAlign: 'right'}}>
              <Typography sx={bodyStyles}>
                {currencyFormatting(
                  subPosition.article.unitSellingAmount?.netAmount || 0,
                  currentCurrency,
                  company?.language,
                )}
              </Typography>
            </TableCell>
            <TableCell sx={{...defaultCellStyles, textAlign: 'right'}}>
              <Typography sx={bodyStyles}>-</Typography>
            </TableCell>
            <TableCell
              sx={{...defaultCellStyles, textAlign: 'right', width: '94px'}}>
              <Typography sx={bodyStyles}>
                {currencyFormatting(
                  subPosition.article.unitSellingAmount?.netAmount || 0,
                  currentCurrency,
                  company?.language,
                )}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={1} sx={defaultCellStyles} />
            <TableCell colSpan={5} sx={defaultCellStyles}>
              <Typography
                sx={{...bodyStyles, width: '100%'}}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    subPosition.article.description || '',
                  ),
                }}
              />
            </TableCell>
          </TableRow>
        </Fragment>
      )),
    [subPositions, t, currentCurrency],
  );

  return (
    <Grid container spacing={2} justifyContent="center">
      <PlaceholderImage src={PreviewFrame} alt="Preview Frame" top={0} />
      <PlaceholderImage src={PreviewFrameTwo} alt="Preview Frame 2" top={155} />

      <Box
        sx={{
          overflowY: 'auto',
          overflowX: 'auto',
          maxWidth: '100%',
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top left',
          transition: 'transform 0.2s ease-in-out',
          zIndex: 1000,
          backgroundColor: 'white',
          marginTop: '1em',
          marginLeft: '2.1em',
          marginBottom: '3em',
          width: '600px',
          marginRight: '2.1em',
          paddingBottom: '6em',
        }}>
        <Table sx={{width: '100%'}}>
          <TableHead>{renderSubRowHeader()}</TableHead>

          <TableBody>{renderTableRows}</TableBody>

          <TableBody sx={{paddingY: '1.1em'}}>
            {renderSubPositionRows}
          </TableBody>

          <TableFooter>
            <TableRow sx={{borderTop: '1.5px solid black'}}>
              <TableCell colSpan={7} sx={{padding: '0'}} />
            </TableRow>

            <TableRow>
              <TableCell
                colSpan={6}
                sx={{...defaultFooterCellStyles, textAlign: 'right'}}>
                <Typography sx={footerBodyTagStyles}>
                  {t('Subtotal excl. VAT')}:
                </Typography>
              </TableCell>
              <TableCell sx={{...defaultFooterCellStyles, textAlign: 'right'}}>
                <Typography sx={footerBodyContentStyles}>
                  {currencyFormatting(
                    mixedPosition?.data.unitSellingAmount?.netAmount || 0,
                    currentCurrency,
                    company?.language,
                  )}
                </Typography>
              </TableCell>
            </TableRow>

            {mixedPosition?.data.unitSellingAmount.vats.map((vat, index) => (
              <TableRow key={vat.vat - index}>
                <TableCell
                  colSpan={6}
                  sx={{...defaultFooterCellStyles, textAlign: 'right'}}>
                  <Typography sx={footerBodyTagStyles}>
                    {`${t('VAT')} ${vat.percentageVat}%`}:
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{...defaultFooterCellStyles, textAlign: 'right'}}>
                  <Typography sx={footerBodyContentStyles}>
                    {currencyFormatting(
                      vat.vat,
                      currentCurrency,
                      company?.language,
                    )}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}

            <TableRow>
              <TableCell
                colSpan={6}
                sx={{...defaultFooterCellStyles, textAlign: 'right'}}>
                <Typography sx={footerBodyContentStyles}>
                  {t('Total incl. VAT')}:
                </Typography>
              </TableCell>
              <TableCell sx={{...defaultFooterCellStyles, textAlign: 'right'}}>
                <Typography sx={footerBodyContentStyles}>
                  {currencyFormatting(
                    mixedPosition?.data.unitSellingAmount?.grossAmount || 0,
                    currentCurrency,
                    company?.language,
                  )}
                </Typography>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Box>

      <PlaceholderImage
        src={PreviewFrameThree}
        alt="Preview Frame 3"
        top={150}
      />
      <PlaceholderImage
        src={PreviewFrameFour}
        alt="Preview Frame 4"
        top={300}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          position: 'absolute',
          right: '40px',
          bottom: '44px',
          zIndex: 1000,
        }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 'bold',
            borderRadius: '4px',
            boxShadow: '0px 4px 15px 0px #90909033',
            padding: '0.5em 1em',
            background: 'white',
            zIndex: 10,
          }}>
          {zoomLevel}%
        </Typography>

        <Button
          onClick={handleZoomIn}
          sx={{
            ...zoomButtonStyles,
          }}>
          +
        </Button>

        <Button
          onClick={handleZoomOut}
          sx={{
            ...zoomButtonStyles,
          }}>
          -
        </Button>
      </Box>
    </Grid>
  );
};

export default PositionPreview;
