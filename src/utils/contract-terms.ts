import {
  ContractPaymentTermView,
  UpdateContractPaymentTermView,
} from 'models/contract';

export const compareArrays = (
  existingContractPaymentTerms: ContractPaymentTermView[],
  newContractPaymentTerms: UpdateContractPaymentTermView[],
) => {
  const itemsInFirstOnly: ContractPaymentTermView[] = [];
  const modifiedItems: UpdateContractPaymentTermView[] = [];
  const newItems: UpdateContractPaymentTermView[] = [];

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
