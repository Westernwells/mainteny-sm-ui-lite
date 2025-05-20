import {Tag as TagType, TagEntityType} from 'models/tag';
import {Box, MenuItem} from '@mui/material';
import React, {ForwardedRef, forwardRef, SyntheticEvent} from 'react';
import Tag from 'components/Tag/index';
import useTheme from '@mui/material/styles/useTheme';
import TagActions from 'components/Tag/TagActions';

type Props = {
  tag: TagType;
  entity: TagEntityType;
  isRenaming?: boolean;
  index: number;
  onClick: (tag: TagType, e: SyntheticEvent) => void;
  onKeyDown?: (e: SyntheticEvent) => void;
  onRename: (tagId: string | null) => void;
};
const TagSearchMenuItem = forwardRef(
  (
    {tag, entity, isRenaming = false, index, onClick, onRename}: Props,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const theme = useTheme();
    return (
      <MenuItem
        component="div"
        tabIndex={index}
        ref={ref}
        key={`search-option-container-tag-${tag.id}`}
        data-testid={`search-option-container-tag-${tag.id}`}
        sx={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '4px',
          padding: '4px',

          '& button': {
            visibility: 'hidden',
          },

          '&:hover': {
            backgroundColor: theme.palette.inputBackground.main,

            '& button': {
              visibility: 'visible',
            },
          },

          '&:focus': {
            backgroundColor: theme.palette.inputBackground.main,

            '& button': {
              visibility: 'visible',
            },
          },
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}>
        <Box
          sx={{
            display: 'flex',
            maxWidth: '240px',
          }}
          onClick={(e) => onClick(tag, e)}>
          <Tag
            key={`search-option-tag-${tag.id}`}
            {...tag}
            entity={entity}
            outsideRenaming={isRenaming}
            maxWidth="260px"
            onRenaming={() => onRename(null)}
          />
        </Box>
        <TagActions
          {...tag}
          onRename={() => {
            onRename(tag.id);
          }}
        />
      </MenuItem>
    );
  },
);

export default TagSearchMenuItem;
