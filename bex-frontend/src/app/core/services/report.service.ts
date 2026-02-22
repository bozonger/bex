import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Wochenbericht, ReportResponse, UserReportItem } from '../interfaces/report.interfaces';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);

  // Prefer environment.ts in real apps
  private readonly API_URL = environment.apiUrl;

  // Backend returns plain text: "File saved successfully."
  saveFile(report: Wochenbericht): Observable<string> {
    return this.http.post(`${this.API_URL}/saveFile`, report, {
      responseType: 'text'
    });
  }

  // You said you fixed the typo -> now calendarWeek
  getFile(calendarWeek: string, year: string): Observable<ReportResponse> {
    const params = new HttpParams()
      .set('calendarWeek', calendarWeek)
      .set('year', year);

    return this.http.get<ReportResponse>(`${this.API_URL}/getFile`, { params });
  }

  getUserReports(): Observable<UserReportItem[]> {
    return this.http.get<UserReportItem[]>(`${this.API_URL}/getUserReports`);
  }
}
