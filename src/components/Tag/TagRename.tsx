import {TAG_COLORS, TagEntityType, TagRecord} from 'models/tag';
import {
  ChangeEvent,
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';
import {useUpdateTag} from 'hooks/reactQuery/useTag';
import {useSnackbar} from 'hooks/useSnackbar';
import {useTranslation} from 'react-i18next';

export type Props = TagRecord & {
  entity: TagEntityType;
  onClose: () => void;
};

const TagRename = ({id, name, color, entity, onClose}: Props) => {
  const {t} = useTranslation();
  const {enqueueSnackbar} = useSnackbar();
  const [chipName, setChipName] = useState<string>(name);
  const {mutateAsync: handleUpdate} = useUpdateTag('Tag renamed');
  const anchorEl = useRef<HTMLInputElement>(null);

  const handleRenameConfirm = async (newName: string) => {
    try {
      await handleUpdate({
        tagId: id,
        name: newName.trim(),
        color,
        entityType: entity,
      });
    } catch (err) {
      enqueueSnackbar(t('Failed to rename tag'), {variant: 'error'});
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChipName(event.target.value);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    event.stopPropagation();
    if (event.key === 'Enter') {
      handleRenameConfirm(chipName);
      onClose();
    }

    if (event.key === 'Escape') {
      onClose();
    }
  };

  // focus on mount
  useEffect(() => {
    anchorEl.current?.focus();
  }, []);

  return (
    <input
      ref={anchorEl}
      type="text"
      value={chipName}
      data-testid={`chip-tag-${name}`}
      maxLength={50}
      placeholder="Tag name"
      required
      style={{
        height: '24px',
        color: TAG_COLORS[color],
        backgroundColor: color,
        borderRadius: '16px',
        border: 'none',
        padding: '0px 8px',
      }}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onBlur={onClose}
    />
  );
};

export default TagRename;
