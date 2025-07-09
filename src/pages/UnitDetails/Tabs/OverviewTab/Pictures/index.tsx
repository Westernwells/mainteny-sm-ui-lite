import {ElevatorView} from 'models/elevator';
import AttachmentsCard from 'components/Attachments/AttachmentsCard';
import {AttachmentEntityType} from 'models/attachment';

interface Props {
  elevator: ElevatorView;
}

export const Pictures = ({elevator}: Props) => (
  <AttachmentsCard
    entityId={elevator.id}
    entityType={AttachmentEntityType.ELEVATOR}
  />
);
