import {Address} from 'models/misc';
import {FileWithPreview} from 'models/files';

export interface BasicInformationCompanyFormModel {
  name: string;
  email: string;
  phone: string;
  url: string;
  logoUrl: string;
  logoFile: FileWithPreview;
  billingAddress: Address | null;
  businessAddress: Address | null;
  postalAddress: Address | null;
}
