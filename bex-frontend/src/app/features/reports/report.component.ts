import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';

import { ReportService } from '../../core/services/report.service';
import { Wochenbericht, UserReportItem } from '../../core/interfaces/report.interfaces';
import { weekValidator, yearValidator } from './validators';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportComponent {
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(ReportService);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  userReports = signal<UserReportItem[]>([]);
  isSubmitting = signal(false);
  isNewReport = signal(true);

  readonly reportForm = this.fb.nonNullable.group<{
    kalenderWoche: FormControl<string>;
    jahr: FormControl<string>;
    bericht: FormControl<string>;
  }>({
    kalenderWoche: this.fb.nonNullable.control('', {
      validators: [Validators.required, weekValidator]
    }),
    jahr: this.fb.nonNullable.control(new Date().getFullYear().toString(), {
      validators: [Validators.required, yearValidator(2000, 2100)]
    }),
    bericht: this.fb.nonNullable.control('', {
      validators: [Validators.required]
    })
  });

  constructor() {
    this.refreshReportList();
  }

  refreshReportList(): void {
    this.reportService
      .getUserReports()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.userReports.set(data),
        error: (err: unknown) => console.error('Error fetching reports', err)
      });
  }

  loadSelectedReport(fileName: string): void {
    this.isSubmitting.set(true);

    const info = this.parseFileName(fileName);

    this.reportService
      .getFile(info.kw, info.year)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
          this.toastr.error('Report could not be loaded.');
          this.isSubmitting.set(false);
        }
      });
  }

  submitReport(): void {
    if (this.reportForm.invalid) return;

    this.isSubmitting.set(true);

    const payload: Wochenbericht = this.reportForm.getRawValue();

    this.reportService
      .saveFile(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('Saved!');
          this.refreshReportList();
          this.isNewReport.set(false);
          this.reportForm.controls.kalenderWoche.disable();
          this.reportForm.controls.jahr.disable();
          this.isSubmitting.set(false);
        },
        error: (err: unknown) => {
          console.error(err);
          this.toastr.error('Failed to save report.');
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

  deleteReport(fileName: string, ev?: Event): void {
    ev?.stopPropagation();

    const { kw, year } = this.parseFileName(fileName);

    if (!confirm(`Delete report for week ${kw}/${year}?`)) return;

    this.isSubmitting.set(true);

    this.reportService
      .deleteFile(kw, year)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('Deleted!');
          this.refreshReportList();

          const current = this.reportForm.getRawValue();
          if (current.kalenderWoche === kw && current.jahr === year) {
            this.createNew();
          }

          this.isSubmitting.set(false);
        },
        error: (err: unknown) => {
          console.error(err);
          this.toastr.error('Failed to delete report.');
          this.isSubmitting.set(false);
        }
      });
  }
}