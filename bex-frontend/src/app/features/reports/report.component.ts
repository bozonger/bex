import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';

import { ReportService } from '../../core/services/report.service';
import { Wochenbericht, UserReportItem } from '../../core/interfaces/report.interfaces';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(ReportService);

  userReports = signal<UserReportItem[]>([]);
  isSubmitting = signal(false);
  isNewReport = signal(true);

  // Strongly typed, matches JSON: kalenderWoche/jahr/bericht
  readonly reportForm = this.fb.nonNullable.group<{
    kalenderWoche: FormControl<string>;
    jahr: FormControl<string>;
    bericht: FormControl<string>;
  }>({
    kalenderWoche: this.fb.nonNullable.control('', { validators: [Validators.required] }),
    jahr: this.fb.nonNullable.control(new Date().getFullYear().toString(), { validators: [Validators.required] }),
    bericht: this.fb.nonNullable.control('', { validators: [Validators.required] })
  });

  ngOnInit(): void {
    this.refreshReportList();
  }

  refreshReportList(): void {
    this.reportService.getUserReports().subscribe({
      next: (data) => this.userReports.set(data),
      error: (err: unknown) => console.error('Error fetching reports', err)
    });
  }

  loadSelectedReport(fileName: string): void {
    this.isSubmitting.set(true);

    const info = this.parseFileName(fileName);

    // Backend: GET /getFile?calendarWeek=...&year=...
    this.reportService.getFile(info.kw, info.year).subscribe({
      next: (res) => {
        const data: Wochenbericht = res.content;

        this.reportForm.patchValue({
          kalenderWoche: data.kalenderWoche,
          jahr: data.jahr,
          bericht: data.bericht
        });

        this.isNewReport.set(false);
        this.reportForm.controls.kalenderWoche.disable();
        this.reportForm.controls.jahr.disable();
        this.isSubmitting.set(false);
      },
      error: (err: unknown) => {
        console.error(err);
        alert('Report could not be loaded.');
        this.isSubmitting.set(false);
      }
    });
  }

  submitReport(): void {
    if (this.reportForm.invalid) return;

    this.isSubmitting.set(true);

    const payload: Wochenbericht = this.reportForm.getRawValue();

    this.reportService.saveFile(payload).subscribe({
      next: () => {
        alert('Gespeichert!');
        this.refreshReportList();
        this.isNewReport.set(false);
        this.reportForm.controls.kalenderWoche.disable();
        this.reportForm.controls.jahr.disable();
        this.isSubmitting.set(false);
      },
      error: (err: unknown) => {
        console.error(err);
        alert('Fehler beim Speichern');
        this.isSubmitting.set(false);
      }
    });
  }

  createNew(): void {
    this.isNewReport.set(true);

    this.reportForm.reset({
      jahr: new Date().getFullYear().toString(),
      kalenderWoche: '',
      bericht: ''
    });

    this.reportForm.controls.kalenderWoche.enable();
    this.reportForm.controls.jahr.enable();
  }

  parseFileName(fileName: string): { kw: string; year: string } {
    const parts = fileName.split('_');
    return {
      kw: parts[3],
      year: parts[5].replace('.json', '')
    };
  }

  trackByReport(_: number, report: { fileName: string }): string {
    return report.fileName;
  }
}