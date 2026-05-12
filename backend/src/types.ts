export interface WeatherRow {
  date: string;
  temp_c: number;
}

export interface IceResult {
  year: number;
  month: number;
  bestDate: string | null;
  maxIceCm: number;
  holdsCow: boolean;
  fddAtPeak: number;
  freezeDays: number;
  thawDays: number;
  message: string;
}
