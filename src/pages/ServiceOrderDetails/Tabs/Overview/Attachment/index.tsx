import React from 'react';
import AttachmentsCard from 'components/Attachments/AttachmentsCard';
import {AttachmentEntityType} from 'models/attachment';

interface Props {
  entityId: string;
  entityType: AttachmentEntityType;
}

export const Attachment = ({entityId, entityType}: Props) => (
  <AttachmentsCard
    entityId={entityId}
    entityType={entityType}
    showAddButton={false}
    showEmptySectionButton
  />
);
