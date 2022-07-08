export interface HolidaysView {
  id: string;
  year: number;
  countryCode: string;
  country_name: string;
  holidays: HolidayItem[];
}

export interface HolidayItem {
  id: string;
  publicHolidayId: string;
  date: string;
  name: string;
  locations: string[];
}
