import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const weekValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const raw = String(control.value ?? '').trim();
  if (!raw) return null; // required validator handles empty
  if (!/^\d{1,2}$/.test(raw)) return { weekFormat: true };

  const week = Number(raw);
  if (!Number.isInteger(week) || week < 1 || week > 53) return { weekRange: true };

  return null;
};

export const yearValidator = (minYear = 2000, maxYear = 2100): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const raw = String(control.value ?? '').trim();
    if (!raw) return null;
    if (!/^\d{4}$/.test(raw)) return { yearFormat: true };

    const year = Number(raw);
    if (!Number.isInteger(year) || year < minYear || year > maxYear) return { yearRange: true };

    return null;
  };