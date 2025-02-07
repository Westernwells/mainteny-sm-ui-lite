import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {ElevatorView} from 'models/elevator';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import AttachmentsCard from 'components/AttachmentsCard';

interface Props {
  elevator: ElevatorView;
  propertyOwnerId?: string;
}

export const Pictures = ({elevator, propertyOwnerId}: Props) => {
  const {user} = useUserSession();

  const {mutateAsync: uploadImages, isLoading} = useUploadFiles(
    'Image uploaded successfully',
  );
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Elevator updated successfully',
  );

  const onSave = async (uploadedFiles: FileWithPreview[]) => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id;
    const uploadPath = `${serviceCompanyId}/elevators/${elevator.id}/images`;
    await uploadImages({files: uploadedFiles, uploadPath});

    const updatedPictures = elevator.additionalInfo.pictures
      ? [
          ...elevator.additionalInfo.pictures,
          ...uploadedFiles.map((item) => {
            const lastDotIndex = item.name.lastIndexOf('.');
            const description =
              lastDotIndex > 0
                ? item.name.substring(0, lastDotIndex)
                : item.name;

            return {
              description,
              type: item.type,
              uri: `${uploadPath}/${item.name}`,
            };
          }),
        ]
      : [
          ...uploadedFiles.map((item) => {
            const lastDotIndex = item.name.lastIndexOf('.');
            const description =
              lastDotIndex > 0
                ? item.name.substring(0, lastDotIndex)
                : item.name;

            return {
              description,
              type: item.type,
              uri: `${uploadPath}/${item.name}`,
            };
          }),
        ];

    await updateElevator({
      body: {
        propertyOwnerId,
        pictures: updatedPictures,
      },
      elevatorId: elevator.id,
    });
  };

  const onDeletePicture = async (id: string) => {
    const filteredPictures = elevator.additionalInfo.pictures.filter(
      (pic) => pic.id !== id,
    );
    await updateElevator({
      elevatorId: elevator.id,
      body: {
        propertyOwnerId,
        pictures: filteredPictures,
      },
    });
  };

  const onSaveFileName = async (fileId: string, fileName: string) => {
    const updatedPictures = elevator.additionalInfo?.pictures?.map((p) =>
      p.id === fileId ? {...p, description: fileName} : p,
    );
    await updateElevator({
      elevatorId: elevator.id,
      body: {
        propertyOwnerId,
        pictures: updatedPictures,
      },
    });
  };

  return (
    <AttachmentsCard
      zoneButtonText="Upload attachment"
      onSaveFileName={onSaveFileName}
      onDeleteFile={onDeletePicture}
      onSaveUploadedFiles={onSave}
      files={elevator?.additionalInfo?.pictures}
      isLoading={isLoading}
    />
  );
};
