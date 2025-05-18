import {Box, Divider, Popover} from '@mui/material';
import {Tag as TagType, TagEntityType, TagRecord} from 'models/tag';
import React, {
  KeyboardEventHandler,
  RefObject,
  SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import SearchInput from 'components/SearchInput/index';
import {useCreateTag, useTags, useTagStatistics} from 'hooks/reactQuery/useTag';
import {generateTag} from 'utils/tag';
import useTheme from '@mui/material/styles/useTheme';
import TagSearchMenuItem from 'components/Tag/TagSearchMenuItem';
import Tag from '.';

const TAGS_PER_REQUEST = 200;

type Props = {
  open: boolean;
  selectedTags: TagType[] | TagRecord[];

  anchorRef: RefObject<HTMLDivElement>;
  entity: TagEntityType;
  onClose: () => void;
  onChange: (tags: TagRecord[]) => void;
};

const TagSearch = ({
  open,
  selectedTags,
  anchorRef,
  entity,
  onClose,
  onChange,
}: Props) => {
  const theme = useTheme();
  const ref = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState<string | undefined>();
  const [renameTagId, setRenameTagId] = useState<string | null>(null);

  const {data: foundTagsResource} = useTags(
    {
      entityType: entity,
      query: search || '',
      pageIndex: 0,
      pageSize: TAGS_PER_REQUEST,
    },
    {
      keepPreviousData: true,
    },
  );

  const {data: foundTagsStatistics} = useTagStatistics(
    {
      entityType: entity,
    },
    {
      keepPreviousData: true,
    },
  );

  const {mutateAsync: handleQueryCreateTag} = useCreateTag();

  const handleSelectTag = (tag: TagType, e: SyntheticEvent) => {
    e.stopPropagation();
    if (!renameTagId || renameTagId !== tag.id) {
      onChange([...selectedTags, tag]);
    }
  };

  const handleCreateTag = (tagName: string) => {
    handleQueryCreateTag(
      generateTag(
        tagName,
        entity,
        foundTagsStatistics
          ? Object.keys(foundTagsStatistics?.numOfTagsPerColors)
          : undefined,
      ),
    );
  };

  const handleKeyDownControl: KeyboardEventHandler<HTMLDivElement> =
    useCallback(
      (e) => {
        if (
          e.key === 'Enter' &&
          search &&
          (!foundTagsResource || foundTagsResource.data.length === 0)
        ) {
          handleCreateTag(search);
        }
      },
      [search, foundTagsResource],
    );

  const handleRenameTag = (tagId: string | null) => {
    setRenameTagId(tagId);
  };

  const handleRemoveTag = (tagId: string) => () => {
    onChange(selectedTags.filter((tag) => tag.id !== tagId));
  };

  const handleClose = (event: SyntheticEvent) => {
    setSearch(undefined);
    setRenameTagId(null);

    // prevent any bubbling
    // tables have a onClick event on roll that is triggered every time popover outside click is triggered
    event.stopPropagation();
    event.preventDefault();
    onClose();
  };

  const showSearchedTags = useMemo(() => {
    if (!foundTagsResource) return [];

    const foundTags = foundTagsResource.data;

    if (selectedTags.length === 0) return foundTags;
    return foundTags.filter(
      (searchTag) =>
        !selectedTags.some((selectedTag) => selectedTag.id === searchTag.id),
    );
  }, [selectedTags, foundTagsResource]);

  return (
    <Popover
      open={open}
      anchorEl={anchorRef.current}
      onClose={handleClose}
      sx={{
        '& .MuiPaper-root': {
          width: '380px',
          minHeight: '228px',
          maxHeight: '580px',
          padding: '16px',
        },
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing(1, 5),
        }}>
        <SearchInput
          refInput={ref}
          defaultValue={search}
          maxLength={50}
          onChange={(val: string) => setSearch(val)}
          onKeyDown={handleKeyDownControl}
          onClick={(event: SyntheticEvent) => {
            // prevent any bubbling
            // tables have a onClick event on roll that is triggered every time popover outside click is triggered
            event.stopPropagation();
            event.preventDefault();
          }}
        />

        <Box
          sx={{
            display: 'flex',
            padding: '8px 0 12px 0',
            gap: theme.spacing(0.5),
            flexWrap: 'wrap',
          }}>
          {selectedTags.map((tag) => (
            <Tag
              key={`search-selected-tag-${tag.id}`}
              {...tag}
              entity={entity}
              withAction
              onDelete={handleRemoveTag(tag.id)}
            />
          ))}
        </Box>

        <Divider sx={{borderColor: theme.palette.grey[300]}} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: '0 0 8px 0',
            gap: theme.spacing(1),
          }}>
          {showSearchedTags.map((tag) => (
            <TagSearchMenuItem
              data-testid={`${!!renameTagId}-${tag.id}`}
              tag={tag}
              entity={entity}
              isRenaming={!!renameTagId && tag.id === renameTagId}
              onClick={handleSelectTag}
              onRename={handleRenameTag}
            />
          ))}
        </Box>
      </Box>
    </Popover>
  );
};

export default TagSearch;
