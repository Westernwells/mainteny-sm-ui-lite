import {AddressRecord} from 'models/misc';

export interface LocationForm {
  address?: AddressRecord;
  building?: string;
  propertySegment?: string;
  keyLocation?: string;
  parking?: string;
}
