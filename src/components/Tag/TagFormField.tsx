import {Box, useTheme} from '@mui/material';
import {TagEntityType, TagRecord} from 'models/tag';
import Tag from 'components/Tag/index';
import {MouseEventHandler, useRef, useState} from 'react';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import TagGroup from 'components/Tag/TagGroup';
import TagSearch from './TagSearch';

type Props = {
  tags: TagRecord[];
  entity: TagEntityType;
  height?: string;
  onChange: (tags: TagRecord[]) => void;
};

const TagFormField = ({tags, entity, height, onChange}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [shownTag, ...rest] = tags;

  const handleOpenSearch: MouseEventHandler<HTMLSpanElement> = (e) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <>
      <Box
        ref={ref}
        onClick={handleOpenSearch}
        sx={{
          borderRadius: '4px',
          border: `1px solid ${theme.palette.grey[200]}`,
          backgroundColor: theme.palette.inputBackground.main,
          width: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center',
          padding: '7px 12px',
          gap: theme.spacing(0.5),

          ...(height && {
            height,
          }),
        }}>
        {tags.length === 0 && (
          <Typography
            sx={{
              color: theme.palette.action.active,
            }}>
            {t('Select tag(s)')}
          </Typography>
        )}
        {tags.length > 0 && (
          <Box sx={{display: 'flex', gap: theme.spacing(0.5)}}>
            <Tag {...shownTag} entity={entity} />
            {rest.length > 0 && <TagGroup tags={rest} />}
          </Box>
        )}
      </Box>
      <TagSearch
        open={isOpen}
        onClose={() => setIsOpen(false)}
        selectedTags={tags}
        entity={entity}
        onChange={onChange}
        anchorRef={ref}
      />
    </>
  );
};

export default TagFormField;
