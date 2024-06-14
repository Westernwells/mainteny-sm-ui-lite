import React, {useRef, useEffect} from 'react';
import {useDropzone} from 'react-dropzone';
import {Box, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {ReactComponent as CloudUploadIcon} from 'assets/icons/CloudUploadIcon.svg';
import {Button} from 'components/Button';
import {Rnd, RndResizeCallback, DraggableData} from 'react-rnd';
import './NewDropZone.css';
import {DraggableEvent} from 'react-draggable';
import {theme} from 'theme';

const BIG_SCREEN_WIDTH: number = 1038;
const BIG_SCREEN_DROPZONE_HEIGHT: number = 151;

const SMALL_SCREEN_WIDTH: number = 684;
const SMALL_SCREEN_DROPZONE_HEIGHT: number = 100;

export interface FileWithPreview extends File {
  preview: string;
}

type DraggableEventHandler = (
  e: DraggableEvent,
  data: DraggableData,
) => void | false;

interface Props {
  hint?: string;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  getAcceptedFiles?: (files: FileWithPreview[]) => void;
  position: {x: number; y: number};
  dimensions: {width: number; height: number};
  setPosition: (position: {x: number; y: number}) => void;
  setDimensions: (dimensions: {width: number; height: number}) => void;
  showBigger: boolean;
  file: FileWithPreview | null;
  setFile: React.Dispatch<React.SetStateAction<FileWithPreview | null>>;
  showHandles: boolean;
  setShowHandles: React.Dispatch<React.SetStateAction<boolean>>;
}

const NewDropZone: React.FC<Props> = ({
  hint = '',
  acceptedFileTypes = ['image/png', 'image/jpeg'],
  maxFiles = 1,
  getAcceptedFiles,
  position,
  dimensions,
  setPosition,
  setDimensions,
  showBigger,
  file,
  setFile,
  showHandles,
  setShowHandles,
}) => {
  const {t} = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const preview = URL.createObjectURL(acceptedFiles[0]);

    const img = new Image();
    img.src = preview;

    img.onload = () => {
      const maxWidth = BIG_SCREEN_WIDTH;
      const maxHeight = 110; // The desired maximum height

      const aspectRatio = img.width / img.height;
      let newWidth = img.width;
      let newHeight = img.height;

      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = maxHeight * aspectRatio;
      }

      if (newWidth > maxWidth) {
        newWidth = maxWidth;
        newHeight = maxWidth / aspectRatio;
      }

      const fileWithPreview = Object.assign(acceptedFiles[0], {
        preview,
        width: img.width,
        height: img.height,
      });

      setFile(fileWithPreview);
      setDimensions({
        width: newWidth,
        height: newHeight,
      });
      setShowHandles(true);
      getAcceptedFiles?.([fileWithPreview]);
    };
  };
  const {getRootProps, getInputProps, open} = useDropzone({
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as {[key: string]: string[]}),
    maxFiles,
    onDropAccepted: onDrop,
  });

  const handleDragStop: DraggableEventHandler = (e, data) => {
    const maxX = BIG_SCREEN_WIDTH - dimensions.width;
    const maxY = BIG_SCREEN_DROPZONE_HEIGHT - dimensions.height;
    const newX = Math.max(0, Math.min(data.x, maxX));
    const newY = Math.max(0, Math.min(data.y, maxY));
    setPosition({x: newX, y: newY});
  };

  const handleResizeStop: RndResizeCallback = (
    _e,
    _direction,
    ref,
    delta,
    newPosition,
  ) => {
    const newWidth = ref.offsetWidth;
    const newHeight = ref.offsetHeight;
    const maxX = BIG_SCREEN_WIDTH - newWidth;
    const maxY = BIG_SCREEN_DROPZONE_HEIGHT - newHeight;

    const newX = Math.max(0, Math.min(newPosition.x, maxX));
    const newY = Math.max(0, Math.min(newPosition.y, maxY));

    setDimensions({width: newWidth, height: newHeight});
    setPosition({x: newX, y: newY});
  };

  useEffect(
    () => () => {
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
    },
    [file],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowHandles(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <Box
      className="container"
      component="section"
      width="100%"
      ref={containerRef}
      sx={{
        position: 'relative',
        height: showBigger
          ? `${BIG_SCREEN_DROPZONE_HEIGHT}px`
          : `${SMALL_SCREEN_DROPZONE_HEIGHT}px`,
        maxWidth: showBigger
          ? `${BIG_SCREEN_WIDTH}px`
          : `${SMALL_SCREEN_WIDTH}px`,
        width: '100%',
      }}>
      {!file && (
        <Box
          {...getRootProps({className: 'dropzone'})}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            backgroundColor: theme.palette.inputBackground.main,
            border: `2px dashed rgba(143, 155, 179, 0.5)`,
            p: '2rem',
            cursor: 'pointer',
            borderRadius: '4px',
            height: showBigger
              ? `${BIG_SCREEN_DROPZONE_HEIGHT}px`
              : `${SMALL_SCREEN_DROPZONE_HEIGHT}px`,
            width: showBigger
              ? `${BIG_SCREEN_WIDTH}px`
              : `${SMALL_SCREEN_WIDTH}px`,
          }}>
          <input {...getInputProps()} />
          <CloudUploadIcon style={{width: '2rem', height: '2rem'}} />
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <Box sx={{display: 'flex', alignItems: 'center'}}>
              <Button
                style={{
                  textTransform: 'inherit',
                  color: theme.palette.text.primary,
                  marginLeft: '-0.5rem',
                }}
                buttonProps={{
                  onClick: open,
                }}>
                {t('Drag and drop or')}
              </Button>
              <Typography
                variant="body2"
                component="div"
                fontWeight={600}
                color={theme.palette.primary.light}>
                {t('Click to upload')}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                letterSpacing: '0.1em',
              }}>
              {t(hint)} {t('(max. 5MB)')}
            </Typography>
          </Box>
        </Box>
      )}

      {showBigger && file && (
        <Box
          sx={{
            background: file ? '#00D1FF14' : theme.palette.inputBackground.main,
            border: '2px dashed #00D1FF14',
            height: '100%',
            maxWidth: '100%',
            width: '100%',
            position: 'relative',
          }}
          onClick={() => setShowHandles(false)}>
          <Rnd
            default={{
              x: position.x,
              y: position.y,
              width: dimensions.width,
              height: dimensions.height,
            }}
            position={{x: position.x, y: position.y}}
            size={{width: dimensions.width, height: dimensions.height}}
            maxWidth={BIG_SCREEN_WIDTH}
            maxHeight={BIG_SCREEN_DROPZONE_HEIGHT}
            bounds="parent"
            enableResizing={{
              right: true,
              left: true,
              top: true,
              bottom: true,
              topRight: true,
              bottomRight: true,
              bottomLeft: true,
              topLeft: true,
            }}
            onMouseEnter={() => setShowHandles(true)}
            onClick={() => setShowHandles(true)}
            onMouseDown={(e) => e.preventDefault()}
            dragAxis="both"
            minWidth={10}
            minHeight={10}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            dragGrid={[1, 1]}>
            <img
              src={file.preview}
              alt="preview"
              style={{
                width: dimensions.width,
                height: dimensions.height,
                objectFit: 'contain',
                maxHeight: `${BIG_SCREEN_DROPZONE_HEIGHT}px`,
                position: 'absolute',
              }}
              crossOrigin="anonymous"
            />
            {showHandles && (
              <>
                {[
                  'top-left',
                  'top',
                  'top-right',
                  'bottom-left',
                  'bottom',
                  'bottom-right',
                ].map((handlePosition) => (
                  <div
                    key={handlePosition}
                    className={`resize-handle ${position}`}
                    style={{
                      [handlePosition.includes('top') ? 'top' : 'bottom']:
                        '-5px',
                      [handlePosition.includes('left')
                        ? 'left'
                        : handlePosition.includes('right')
                        ? 'right'
                        : 'left']:
                        handlePosition === 'top' || handlePosition === 'bottom'
                          ? '50%'
                          : '-5px',
                    }}
                  />
                ))}
                {['top-line', 'bottom-line'].map((line) => (
                  <div
                    key={line}
                    className={`handle-line ${line}`}
                    style={{
                      [line.split('-')[0]]: '-1px',
                      left: '0',
                      width: '100%',
                      height: '2px',
                    }}
                  />
                ))}
                {['left-line', 'right-line'].map((line) => (
                  <div
                    key={line}
                    className={`handle-line ${line}`}
                    style={{
                      top: '0',
                      [line.split('-')[0]]: '-1px',
                      width: '2px',
                      height: '100%',
                    }}
                  />
                ))}
              </>
            )}
          </Rnd>
        </Box>
      )}
    </Box>
  );
};

export default NewDropZone;
