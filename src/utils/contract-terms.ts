import {ContractTermView, UpdateContractTermView} from 'models/contract';

export const compareArrays = (
  existingContractPaymentTerms: ContractTermView[],
  newContractPaymentTerms: UpdateContractTermView[],
) => {
  const itemsInFirstOnly: ContractTermView[] = [];
  const modifiedItems: UpdateContractTermView[] = [];
  const newItems: UpdateContractTermView[] = [];

  existingContractPaymentTerms.forEach((firstItem) => {
    const matchingItem = newContractPaymentTerms.find(
      (secondItem) => secondItem.id === firstItem.id,
    );
    if (!matchingItem) {
      itemsInFirstOnly.push(firstItem);
    } else {
      const modifiedItem = {...matchingItem, id: firstItem.id};
      modifiedItems.push(modifiedItem);
    }
  });

  newContractPaymentTerms.forEach((secondItem) => {
    const matchingItem = existingContractPaymentTerms.find(
      (firstItem) => secondItem.id === firstItem.id,
    );
    if (!matchingItem) {
      newItems.push(secondItem);
    }
  });

  return {
    itemsInFirstOnly,
    modifiedItems,
    newItems,
  };
};
