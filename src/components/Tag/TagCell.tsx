import {TagEntityType, TagRecord} from 'models/tag';
import TagGroup from 'components/Tag/TagGroup';
import {Box} from '@mui/system';
import Tag from 'components/Tag/index';
import TagSearch from 'components/Tag/TagSearch';
import {useRef, useState} from 'react';
import useTheme from '@mui/material/styles/useTheme';

type Props = {
  tags: TagRecord[];
  entity?: TagEntityType;
  onChange?: (tags: TagRecord[]) => void;
  disabled?: boolean;
};

const TagCell = ({tags, entity, onChange, disabled = false}: Props) => {
  const theme = useTheme();
  const [shownTag, ...rest] = tags;
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <>
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
        }}
        onClick={(e) => {
          e.stopPropagation();

          if (disabled) return;

          setIsOpen(true); // set
        }}>
        {tags.length > 0 && (
          <Box sx={{display: 'flex', gap: theme.spacing(0.5)}}>
            <Tag
              id={shownTag.id}
              name={shownTag.name}
              color={shownTag.color}
              entity={entity}
              maxWidth="168px"
            />
            {rest.length > 0 && <TagGroup tags={rest} />}
          </Box>
        )}
        {tags.length === 0 && '-'}
      </Box>
      {isOpen && !!entity && !!onChange && (
        <TagSearch
          open={isOpen}
          onClose={() => {
            setIsOpen(false);
          }}
          selectedTags={tags}
          entity={entity}
          onChange={onChange}
          anchorRef={ref}
        />
      )}
    </>
  );
};

export default TagCell;
