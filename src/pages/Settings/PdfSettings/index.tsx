import React, {useEffect, useState} from 'react';
import {Box} from '@mui/material';
import NewDropZone, {FileWithPreview} from 'components/MyDropZone/NewDropZone';
import PdfSkeleton from 'assets/images/PdfSkeleton.svg';
import PdfBigSkeleton from 'assets/images/PdfBigSkeleton.svg';
import {t} from 'i18next';
import {theme} from 'theme';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {ServiceCompanyItem} from 'models/service-company';
import {useUuid} from 'hooks/reactQuery/useUuid';
import {
  useQueryClientStorageData,
  useUpdateServiceCompanyClientStorage,
} from 'hooks/useClientStorage';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {Progress} from 'components/Progress';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {Button} from 'components/Button';
import {ClientDataRecord} from 'models/client-storage';
import {HeaderFooterInfoData} from 'models/misc';

const BIG_SCREEN_WIDTH: number = 1038;
const BIG_SCREEN_DROPZONE_HEIGHT: number = 151;

const SMALL_SCREEN_WIDTH: number = 684;
const SMALL_SCREEN_DROPZONE_HEIGHT: number = 100;

const PDF_SCREEN_WIDTH: number = 595;
const PDF_SCREEN_DROPZONE_HEIGHT: number = 86;

type Position = {x: number; y: number};
type Dimensions = {width: number; height: number};

type PdfTemplateData = {
  header?: HeaderFooterInfoData;
  footer?: HeaderFooterInfoData;
};

type Props = {
  company: ServiceCompanyItem;
};

const PdfSettings = ({company}: Props) => {
  const {data: uuid} = useUuid();
  const [headerPosition, setHeaderPosition] = useState<Position>({x: 0, y: 0});
  const [headerDimensions, setHeaderDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [footerPosition, setFooterPosition] = useState<Position>({x: 0, y: 0});
  const [footerDimensions, setFooterDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [headerFile, setHeaderFile] = useState<FileWithPreview | null>(null);
  const [footerFile, setFooterFile] = useState<FileWithPreview | null>(null);

  const [showBigger, setShowBigger] = useState<boolean>(false);

  const uploadPath = `${company.id}/settings/template/${uuid}`;

  const {mutateAsync: updateClientStorage} =
    useUpdateServiceCompanyClientStorage('PDF template updated sucessfully');

  const {mutateAsync: uploadImages} = useUploadFiles('', company?.id);

  const {data: clientStorageData, isLoading} = useQueryClientStorageData({
    serviceCompanyId: company?.id,
    params: {key: 'pdf-template'},
  });

  const getParsedInfo = (storageData?: ClientDataRecord) => {
    const data = JSON.parse(storageData?.value || '{}');
    return {headerInfo: data.header, footerInfo: data.footer};
  };

  const resetDimensions = () => {
    setHeaderPosition({x: 0, y: 0});
    setHeaderDimensions({width: 100, height: 50});
    setFooterPosition({x: 0, y: 0});
    setFooterDimensions({width: 100, height: 50});
  };

  const initializeDimensions = (storageData?: ClientDataRecord) => {
    const scaleX = SMALL_SCREEN_WIDTH / PDF_SCREEN_WIDTH;
    const scaleY = SMALL_SCREEN_DROPZONE_HEIGHT / PDF_SCREEN_DROPZONE_HEIGHT;

    try {
      const {header, footer} = JSON.parse(storageData?.value || '{}');
      if (header) {
        setHeaderPosition({x: header.posX * scaleX, y: header.posY * scaleY});
        setHeaderDimensions({
          width: header.width * scaleX,
          height: header.height * scaleY,
        });
      }

      if (footer) {
        setFooterPosition({x: footer.posX * scaleX, y: footer.posY * scaleY});
        setFooterDimensions({
          width: footer.width * scaleX,
          height: footer.height * scaleY,
        });
      }
    } catch (error) {
      resetDimensions();
    }
  };

  const getFileData = (
    file: FileWithPreview,
    dimensions: Dimensions,
    position: Position,
  ) => {
    const widthScale = PDF_SCREEN_WIDTH / BIG_SCREEN_WIDTH;
    const heightScale = PDF_SCREEN_DROPZONE_HEIGHT / BIG_SCREEN_DROPZONE_HEIGHT;

    return {
      path: uploadPath.concat('/').concat(file.name),
      width: dimensions.width * widthScale,
      height: dimensions.height * heightScale,
      posX: position.x * widthScale,
      posY: position.y * heightScale,
    };
  };

  const {headerInfo, footerInfo} = getParsedInfo(clientStorageData);

  const {data: headerUrl = {}} = useDownloadUrl(
    headerInfo?.path ? [headerInfo.path] : [],
    undefined,
    company?.id,
  );

  const {data: footerUrl = {}} = useDownloadUrl(
    footerInfo?.path ? [footerInfo.path] : [],
    undefined,
    company?.id,
  );

  const selectFile = async (isFooter = false) => {
    setShowBigger(true);

    const initialX = BIG_SCREEN_WIDTH - 320 - 40;

    if (isFooter) {
      setFooterPosition({x: initialX, y: 30});
      setFooterDimensions({width: 258, height: 52});
    } else {
      setHeaderPosition({x: initialX, y: 30});
      setHeaderDimensions({width: 258, height: 52});
    }
  };

  const handleCancel = () => {
    setShowBigger(false);
    setHeaderFile(null);
    setFooterFile(null);

    initializeDimensions(clientStorageData);
  };

  const handleSave = async () => {
    const files: FileWithPreview[] = [];

    if (headerFile) files.push(headerFile);
    if (footerFile) files.push(footerFile);

    if (files.length) {
      await uploadImages({files, uploadPath});
    }

    const dataToSave: PdfTemplateData = {
      header: headerFile
        ? getFileData(headerFile, headerDimensions, headerPosition)
        : undefined,
      footer: footerFile
        ? getFileData(footerFile, footerDimensions, footerPosition)
        : undefined,
    };

    setShowBigger(false);

    await updateClientStorage({
      body: {
        key: 'pdf-template',
        value: JSON.stringify(dataToSave),
      },
      serviceCompanyId: company?.id || '',
    });

    handleCancel();
  };

  useEffect(() => {
    if (clientStorageData) {
      initializeDimensions(clientStorageData);
    }
  }, [clientStorageData]);

  const renderDropBox = (
    imagePath: string | null,
    height: number,
    locationImageDimensions: Dimensions,
    locationImagePosition: Position,
    setPosition: React.Dispatch<React.SetStateAction<Position>>,
    setDimensions: React.Dispatch<React.SetStateAction<Dimensions>>,
    file: FileWithPreview | null,
    setFile: React.Dispatch<React.SetStateAction<FileWithPreview | null>>,
    isFooter: boolean,
  ) =>
    imagePath ? (
      <Box
        sx={{
          background: theme.palette.inputBackground.main,
          height,
          cursor: 'pointer',
          width: `${SMALL_SCREEN_WIDTH}px`,
        }}
        onClick={() => setShowBigger(true)}>
        <img
          alt="DropZone"
          src={imagePath}
          style={{
            width: locationImageDimensions.width,
            height: locationImageDimensions.height,
            left: locationImagePosition.x,
            top: locationImagePosition.y,
            objectFit: 'contain',
            position: 'absolute',
          }}
        />
      </Box>
    ) : (
      <Box
        sx={{
          background: theme.palette.inputBackground.main,
          height,
          position: 'relative',
        }}>
        <NewDropZone
          hint="JPEG OR PNG"
          getAcceptedFiles={() => selectFile(isFooter)}
          acceptedFileTypes={['image/png', 'image/jpeg']}
          maxFiles={1}
          position={locationImagePosition}
          dimensions={locationImageDimensions}
          setPosition={setPosition}
          setDimensions={setDimensions}
          showBigger={showBigger}
          file={file}
          setFile={setFile}
        />
      </Box>
    );

  if (isLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexGrow={1}>
        <Progress height="100%" />
      </Box>
    );
  }

  return (
    <Box
      position="relative"
      margin="0 auto"
      display="flex"
      justifyContent="center">
      {!showBigger ? (
        <Box
          sx={{
            width: `${SMALL_SCREEN_WIDTH}px`,
            margin: '0em auto',
            background: 'white',
            position: 'absolute',
          }}>
          <Box
            sx={{
              width: `${SMALL_SCREEN_WIDTH}px`,
              position: 'relative',
            }}>
            {renderDropBox(
              headerUrl[headerInfo?.path],
              100,
              headerDimensions,
              headerPosition,
              setHeaderPosition,
              setHeaderDimensions,
              headerFile,
              setHeaderFile,
              false,
            )}
          </Box>

          <Box
            sx={{
              margin: '0 2em 0em 4.5em',
              textAlign: 'center',
              maxWidth: '573px',
              height: '570px',
            }}>
            <img alt="Skeleton" src={PdfSkeleton} />
          </Box>

          <Box
            sx={{
              width: `${SMALL_SCREEN_WIDTH}px`,
              margin: '0em auto 3.5em auto',
              background: theme.palette.primary.contrastText,
              position: 'absolute',
            }}>
            {renderDropBox(
              footerUrl[footerInfo?.path],
              100,
              footerDimensions,
              footerPosition,
              setFooterPosition,
              setFooterDimensions,
              footerFile,
              setFooterFile,
              true,
            )}
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            width: `${BIG_SCREEN_WIDTH}px`,
            margin: '0em auto 3.5em auto',
            background: theme.palette.primary.contrastText,
          }}>
          {renderDropBox(
            null,
            151,
            headerDimensions,
            headerPosition,
            setHeaderPosition,
            setHeaderDimensions,
            headerFile,
            setHeaderFile,
            false,
          )}
          <Box
            sx={{
              background: theme.palette.background.paper,
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.5rem 2rem',
              borderBottom: '1px solid #222B451F',
            }}>
            <Button
              buttonProps={{
                onClick: () => setHeaderFile(null),
                variant: 'text',
                startIcon: (
                  <DeleteOutlinedIcon
                    sx={{color: theme.palette.text.secondary}}
                  />
                ),
              }}>
              {t('Delete Image')}
            </Button>
          </Box>
          <Box
            sx={{
              margin: '0 2em 0em 6.5em',
              textAlign: 'center',
              maxWidth: '870px',
              height: '770px',
            }}>
            <img alt="Big Skeleton" src={PdfBigSkeleton} />
          </Box>
          <Box
            sx={{
              background: theme.palette.background.paper,
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.5rem 2rem',
              borderTop: '1px solid #222B451F',
            }}>
            <Button
              buttonProps={{
                onClick: () => setFooterFile(null),
                variant: 'text',
                startIcon: (
                  <DeleteOutlinedIcon
                    sx={{color: theme.palette.text.secondary}}
                  />
                ),
              }}>
              {t('Delete Image')}
            </Button>
          </Box>
          {renderDropBox(
            null,
            151,
            footerDimensions,
            footerPosition,
            setFooterPosition,
            setFooterDimensions,
            footerFile,
            setFooterFile,
            true,
          )}
        </Box>
      )}

      {showBigger && (
        <Box
          sx={{
            position: 'fixed',
            left: 322, // must be equal to sidebar width
            right: 0,
            bottom: 0,
            background: theme.palette.background.paper,
            boxShadow: theme.shadows[3],
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.6rem 2rem',
          }}>
          <Button
            disabled={false}
            buttonProps={{
              onClick: handleCancel,
              variant: 'text',
              color: 'error',
            }}>
            {t('Cancel')}
          </Button>

          <Button
            buttonProps={{
              onClick: handleSave,
              variant: 'contained',
            }}>
            {t('Save')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PdfSettings;
