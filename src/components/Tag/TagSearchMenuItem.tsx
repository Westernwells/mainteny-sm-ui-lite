import {Tag as TagType, TagEntityType} from 'models/tag';
import {Box} from '@mui/material';
import React from 'react';
import Tag from 'components/Tag/index';
import TagActions from 'components/Tag/TagActions';
import useTheme from '@mui/material/styles/useTheme';

type Props = {
  tag: TagType;
  entity: TagEntityType;
  isRenaming?: boolean;
  onClick: (tag: TagType) => void;
  onRename: (tagId: string | null) => void;
};
const TagSearchMenuItem = ({
  tag,
  entity,
  isRenaming = false,
  onClick,
  onRename,
}: Props) => {
  const theme = useTheme();
  return (
    <Box
      key={`search-option-container-tag-${tag.id}`}
      data-testid={`search-option-container-tag-${tag.id}`}
      sx={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '4px',
        padding: '6px',

        '&:hover': {
          backgroundColor: theme.palette.inputBackground.main,
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
        onClick={() => onClick(tag)}>
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
    </Box>
  );
};

export default TagSearchMenuItem;
