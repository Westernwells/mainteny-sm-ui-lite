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
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import {Trans} from 'react-i18next';
import useKeyboardNavigationControls from 'hooks/useKeyboardNavigationControls';
import Tag from '.';

const TAGS_PER_REQUEST = 200;

type Props = {
  open: boolean;
  selectedTags: TagType[] | TagRecord[];
  anchorRef: RefObject<HTMLDivElement>;
  entity: TagEntityType;
  onClose: () => void;
  onChange: (tags: TagRecord[]) => void;
  testId?: string;
};

const TagSearch = ({
  open,
  selectedTags,
  anchorRef,
  entity,
  onClose,
  onChange,
  testId,
}: Props) => {
  const theme = useTheme();
  const ref = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
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

  const isActionCreateTag =
    !foundTagsResource || foundTagsResource.data.length === 0;

  const handleSelectTag = (tag: TagType, e: SyntheticEvent | KeyboardEvent) => {
    e.stopPropagation();
    if (!renameTagId || renameTagId !== tag.id) {
      onChange([...selectedTags, tag]);
    }
  };

  const handleEnterSelectTag = useCallback(
    (index: number, e: KeyboardEvent) => {
      const foundTag = foundTagsResource?.data[index];
      if (!foundTag) return;

      handleSelectTag(foundTag, e);
    },
    [foundTagsResource],
  );

  const {itemRefs} = useKeyboardNavigationControls<HTMLDivElement>({
    elementRef: popupRef.current,
    itemCount: foundTagsResource?.data.length || 0,
    isOpen: open,
    initialIndex: 0,
    onSelect: handleEnterSelectTag,
    onClose,
  });

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
        if (e.key === 'Enter' && search && isActionCreateTag) {
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
      data-testid={testId}
      sx={{
        '& .MuiPaper-root': {
          position: 'relative',
          width: 'fit-content',
          height: 'fit-content',
          overflow: 'hidden',
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
          padding: '16px 16px 0px 16px',
          display: 'flex',
          flexDirection: 'column',
          width: '380px',
          minHeight: '228px',
          maxHeight: '580px',
          overflowY: 'auto',
        }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}>
          <Box
            sx={{
              display: 'flex',
              marginBottom: theme.spacing(1.5),
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
          </Box>

          <Box
            data-testid="selected-tag-container"
            sx={{
              display: 'flex',
              padding: '8px 0',
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
            ref={popupRef}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              padding: '6px 0',
            }}>
            {showSearchedTags.map((tag, index) => (
              <TagSearchMenuItem
                ref={(el) => {
                  if (itemRefs.current) {
                    itemRefs.current[index] = el;
                  }
                }}
                data-testid={`${!!renameTagId}-${tag.id}`}
                tag={tag}
                entity={entity}
                index={index}
                isRenaming={!!renameTagId && tag.id === renameTagId}
                onClick={handleSelectTag}
                onRename={handleRenameTag}
              />
            ))}
          </Box>
        </Box>

        {isActionCreateTag && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing(3),
              marginTop: theme.spacing(1.5),
              color: theme.palette.text.secondary,
            }}>
            <Trans
              i18nKey="press_enter_to_create_tag"
              style={{fontSize: '14px', color: theme.palette.text.secondary}}
              components={{
                Image: (
                  <SubdirectoryArrowLeftIcon
                    sx={{
                      background: '#0F4C6414',
                      color: theme.palette.primary.main,
                      borderRadius: '2px',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      margin: '0 6px',
                    }}
                  />
                ),
              }}
            />
          </Box>
        )}
      </Box>
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          left: 0,
        }}>
        {/* <Footer /> */}
      </Box>
    </Popover>
  );
};

export default TagSearch;
