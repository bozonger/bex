import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment.development';
import { Wochenbericht } from '../../core/interfaces/auth.interfaces';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  userReports = signal<any[]>([]);
  isSubmitting = signal(false);
  isNewReport = signal(true);

  reportForm = new FormGroup({
    KalenderWoche: new FormControl('', [Validators.required]),
    Jahr: new FormControl(new Date().getFullYear().toString(), [Validators.required]),
    Bericht: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
    this.refreshReportList();
  }

  refreshReportList(): void {
    this.http.get<any[]>(`${this.apiUrl}/getMyReports`).subscribe({
      next: (data) => this.userReports.set(data),
      error: (err) => console.error('Error fetching reports', err)
    });
  }

  loadSelectedReport(fileName: string): void {
    this.isSubmitting.set(true);
    const info = this.parseFileName(fileName);

    const formData = new FormData();
    formData.append('calenderWeek', info.kw);
    formData.append('year', info.year);

    this.http.post(`${this.apiUrl}/getFile`, formData, { responseType: 'text' }).subscribe({
      next: (rawJson) => {
        const data: Wochenbericht = JSON.parse(rawJson);
        
        this.reportForm.patchValue({
          KalenderWoche: data.KalenderWoche,
          Jahr: data.Jahr,
          Bericht: data.Bericht
        });

        this.isNewReport.set(false);
        this.reportForm.controls.KalenderWoche.disable();
        this.reportForm.controls.Jahr.disable();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error(err);
        alert('Report could not be loaded.');
        this.isSubmitting.set(false);
      }
    });
  }

  submitReport(): void {
    if (this.reportForm.invalid) return;
    this.isSubmitting.set(true);
    
    const payload = this.reportForm.getRawValue();

    this.http.post(`${this.apiUrl}/saveFile`, payload, { responseType: 'text' }).subscribe({
      next: () => {
        alert('Gespeichert!');
        this.refreshReportList();
        this.isNewReport.set(false);
        this.reportForm.controls.KalenderWoche.disable();
        this.reportForm.controls.Jahr.disable();
        this.isSubmitting.set(false);
      },
      error: () => {
        alert('Fehler beim Speichern');
        this.isSubmitting.set(false);
      }
    });
  }

  createNew(): void {
    this.isNewReport.set(true);
    this.reportForm.reset({
      Jahr: new Date().getFullYear().toString(),
      KalenderWoche: '',
      Bericht: ''
    });
    this.reportForm.controls.KalenderWoche.enable();
    this.reportForm.controls.Jahr.enable();
  }

  parseFileName(fileName: string) {
    const parts = fileName.split('_');
    return { 
      kw: parts[3], 
      year: parts[5].replace('.json', '') 
    };
  }
}