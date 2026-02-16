import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Wochenbericht } from '../interfaces/auth.interfaces';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  sendReportData(data: any) {
    const formData = new FormData();
    formData.append('KalendarWoche', data.KalendarWoche);
    formData.append('Jahr', data.Jahr);
    formData.append("Bericht", data.Bericht);

    const headers = new HttpHeaders({
      'accept': 'text/plain'
    });

    return this.http.post(this.API_URL + '/sendFile', formData, {
      headers: headers,
      responseType: 'text'
    })
  }

  getFile(fileName: string) {
    return this.http.get<Wochenbericht>(`${this.API_URL}/getFile/${fileName}`);
  }
}