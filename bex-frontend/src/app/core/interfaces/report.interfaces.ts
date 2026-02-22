export interface Wochenbericht {
  kalenderWoche: string;
  jahr: string;
  bericht: string;
}

export interface ReportResponse {
  fileName: string;
  content: Wochenbericht;
}

export interface UserReportItem {
  id: number;
  fileName: string;
}