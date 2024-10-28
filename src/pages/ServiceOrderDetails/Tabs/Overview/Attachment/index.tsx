import React from 'react';
import {useUpdateServiceOrder} from 'hooks/reactQuery/useServiceOrder';
import {ServiceOrderView, UpdateServiceOrderBody} from 'models/service-order';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import AttachmentsCard from 'components/AttachmentsCard';

interface Props {
  order: ServiceOrderView;
}

export const Attachment = ({order}: Props) => {
  const {user} = useUserSession();
  const {mutateAsync: uploadFiles, isLoading: isUploadLoading} = useUploadFiles(
    'Documents uploaded successfully',
  );

  const {mutate: updateServiceOrder, isLoading: isOrderUpdateLoading} =
    useUpdateServiceOrder('Documents updated successfully');

  const uploadedDocument = order?.additionalInfo?.documents || [];

  const onSave = async (uploadedFiles: FileWithPreview[]) => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id;
    const uploadPath = `${serviceCompanyId}/serviceOrders/${order.id}/documents`;
    await uploadFiles({files: uploadedFiles, uploadPath});

    const updatedDocuments = order?.additionalInfo?.documents
      ? [
          ...order.additionalInfo.documents,
          ...uploadedFiles.map((item) => ({
            description: item.name.split('.')[0],
            type: item.type,
            uri: `${uploadPath}/${item.name}`,
          })),
        ]
      : [
          ...uploadedFiles.map((item) => ({
            description: item.name.split('.')[0],
            type: item.type,
            uri: `${uploadPath}/${item.name}`,
          })),
        ];

    updateServiceOrder({
      body: {
        documents: updatedDocuments,
      } as Partial<UpdateServiceOrderBody>,
      serviceOrderId: order.id,
    });
  };

  const onRemoveDoc = async (id: string) => {
    const documentsToSave = uploadedDocument?.length
      ? uploadedDocument?.filter((d) => d.id !== id)
      : [];

    updateServiceOrder({
      body: {
        documents: documentsToSave,
      } as Partial<UpdateServiceOrderBody>,
      serviceOrderId: order.id,
    });
  };

  const onSaveFileName = async (fileId: string, fileName: string) => {
    const updatedDocuments = uploadedDocument?.map((d) =>
      d.id === fileId ? {...d, description: fileName} : d,
    );

    updateServiceOrder({
      body: {
        documents: updatedDocuments,
      },
      serviceOrderId: order.id,
    });
  };

  return (
    <AttachmentsCard
      showAddButton={false}
      isMinHeight={false}
      zoneButtonText="Upload attachment"
      showEmptySectionButton
      files={uploadedDocument}
      isLoading={isUploadLoading || isOrderUpdateLoading}
      onSaveFileName={onSaveFileName}
      onDeleteFile={onRemoveDoc}
      onSaveUploadedFiles={onSave}
    />
  );
};
