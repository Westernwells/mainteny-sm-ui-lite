import {TAG_COLORS, TagEntityType, TagRecord} from 'models/tag';
import Typography from '@mui/material/Typography';
import {MouseEventHandler, useEffect, useState} from 'react';
import TagActions from 'components/Tag/TagActions';
import TagRename from 'components/Tag/TagRename';
import {Box} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import IconButton from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';

type Props = TagRecord & {
  entity?: TagEntityType;
  withAction?: boolean;
  outsideRenaming?: boolean;
  maxWidth?: string;
  onRenaming?: () => void;
  onDelete?: () => void;
};

const Tag = ({
  id,
  name,
  color,
  entity,
  withAction = false,
  outsideRenaming = false,
  maxWidth,
  onRenaming,
  onDelete,
}: Props) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleHover = (value: boolean) => () => {
    if (withAction) setIsHovered(value);
  };

  const closeRename = () => {
    onRenaming?.();
    setIsRenaming(false);
  };

  const handleRename = () => {
    setIsRenaming(true);
  };

  const handleRemove: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    onDelete?.();
  };

  useEffect(() => {
    setIsRenaming(outsideRenaming);
  }, [outsideRenaming]);

  if (isRenaming && entity)
    return (
      <TagRename
        id={id}
        name={name}
        color={color}
        entity={entity}
        onClose={closeRename}
      />
    );

  return (
    <span
      data-testid={`chip-tag-${name}`}
      onMouseEnter={handleHover(true)}
      onMouseLeave={handleHover(false)}
      style={{
        color: TAG_COLORS[color],
        backgroundColor: color,
        padding: '0 6px',
        borderRadius: '16px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        alignSelf: 'center',
        cursor: 'pointer',
        width: 'fill-available',

        ...(maxWidth && {
          maxWidth,
        }),
      }}>
      <Typography noWrap variant="subtitle2">
        {name}
      </Typography>
      {isHovered && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: color,
            marginLeft: '-43px',
            borderRadius: '16px',
            zIndex: 10,
          }}>
          <TagActions id={id} onRename={handleRename} iconPadding="0" />
          {!!onDelete && (
            <IconButton
              sx={{color: theme.palette.primary.dark, padding: 0}}
              onClick={handleRemove}
              size="small">
              <CloseOutlinedIcon />
            </IconButton>
          )}
        </Box>
      )}
    </span>
  );
};

export default Tag;
