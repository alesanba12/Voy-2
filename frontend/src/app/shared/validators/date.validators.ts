import { SchemaPath, validate } from '@angular/forms/signals';

export interface DateOffset {
  years?: number;
  months?: number;
  days?: number;
}

export interface DateValidatorOptions {
  message?: string;
}

/**
 * Parsea un string 'A-M-D' (ej: '18-0-0', '0-6-15') o un objeto DateOffset.
 * Si se omite o es vacío, devuelve { years: 0, months: 0, days: 0 } (hoy).
 */
function parseOffset(offset?: string | DateOffset): Required<DateOffset> {
  if (!offset) {
    return { years: 0, months: 0, days: 0 };
  }

  if (typeof offset === 'string') {
    const [years = 0, months = 0, days = 0] = offset.split('-').map((n) => Number(n) || 0);
    return { years, months, days };
  }

  return {
    years: offset.years ?? 0,
    months: offset.months ?? 0,
    days: offset.days ?? 0
  };
}

/**
 * Calcula la fecha límite sumando o restando (años, meses, días) a la fecha de hoy.
 */
function getReferenceDate(offset: Required<DateOffset>, direction: 'past' | 'future'): Date {
  const ref = new Date();
  ref.setHours(0, 0, 0, 0);

  const sign = direction === 'past' ? -1 : 1;
  ref.setFullYear(ref.getFullYear() + sign * offset.years);
  ref.setMonth(ref.getMonth() + sign * offset.months);
  ref.setDate(ref.getDate() + sign * offset.days);

  return ref;
}

function parseInputDate(raw: string): Date {
  const [year, month, day] = raw.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function resolveArgs(
  offsetOrOptions?: string | DateOffset | DateValidatorOptions,
  options?: DateValidatorOptions
): { offset: Required<DateOffset>; opts?: DateValidatorOptions } {
  if (
    offsetOrOptions &&
    typeof offsetOrOptions === 'object' &&
    'message' in offsetOrOptions &&
    !('years' in offsetOrOptions || 'months' in offsetOrOptions || 'days' in offsetOrOptions)
  ) {
    return { offset: parseOffset(), opts: offsetOrOptions };
  }

  return {
    offset: parseOffset(offsetOrOptions as string | DateOffset | undefined),
    opts: options
  };
}

/**
 * Valida que la fecha ingresada sea estrictamente ANTERIOR a (hoy - A-M-D).
 * Ej: dateBefore(path.birthday, '18-0-0') -> debe tener más de 18 años.
 * Ej: dateBefore(path.birthday) -> debe ser anterior a hoy (@Past).
 */
export function dateBefore(
  path: SchemaPath<string>,
  offset?: string | DateOffset | DateValidatorOptions,
  options?: DateValidatorOptions
): void {
  const { offset: resolvedOffset, opts } = resolveArgs(offset, options);

  validate(path, ({ value }) => {
    const raw = value();
    if (!raw) return null;

    const selected = parseInputDate(raw);
    const limit = getReferenceDate(resolvedOffset, 'past');

    return selected < limit
      ? null
      : {
          kind: 'dateBefore',
          message: opts?.message ?? 'La fecha no cumple con la antigüedad requerida'
        };
  });
}

/**
 * Valida que la fecha ingresada sea estrictamente POSTERIOR a (hoy + A-M-D).
 * Ej: dateAfter(path.eventDate, '0-0-7') -> el evento debe crearse con al menos 7 días de anticipación.
 * Ej: dateAfter(path.eventDate) -> debe ser posterior a hoy (@Future).
 */
export function dateAfter(
  path: SchemaPath<string>,
  offset?: string | DateOffset | DateValidatorOptions,
  options?: DateValidatorOptions
): void {
  const { offset: resolvedOffset, opts } = resolveArgs(offset, options);

  validate(path, ({ value }) => {
    const raw = value();
    if (!raw) return null;

    const selected = parseInputDate(raw);
    const limit = getReferenceDate(resolvedOffset, 'future');

    return selected > limit
      ? null
      : {
          kind: 'dateAfter',
          message: opts?.message ?? 'La fecha debe ser posterior al plazo mínimo'
        };
  });
}