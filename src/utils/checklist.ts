import {
  CheckListComponentOptionColor,
  CheckListComponentType,
  CheckListComponentView,
} from 'models/checklist';
import {getUniqueId} from './utils';

export const getOptionMock = () => ({
  id: getUniqueId(),
  text: '',
  color: CheckListComponentOptionColor.DEFAULT,
  isDefault: false,
});

export const getComponentMock = (type: CheckListComponentType) => ({
  id: getUniqueId(),
  subject: '',
  type,
  options: [getOptionMock()],
  orderNumber: 0,
  moreInfoInNote: false,
  checked: false,
});

export const checkListComponentViewToExtendedCreateCheckListRecord = (
  components: CheckListComponentView[],
) =>
  components.map((c) => ({
    id: c.id,
    subject: c.subject,
    type: c.type,
    options: c.additionalInfo.options.map((o) => ({
      id: getUniqueId(),
      text: o.text,
      color: o.color,
    })),
    orderNumber: c.additionalInfo.orderNumber,
    moreInfoInNote: c.additionalInfo.moreInfoInNote,
  }));
