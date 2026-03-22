import dayjs, { type Dayjs } from 'dayjs';

const DISPLAY_FORMAT = 'YYYY-MM-DD';

export function formatDate(value?: string | null): string {
  if (!value) {
    return '-';
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(DISPLAY_FORMAT) : value;
}

export function toDayjs(value?: string | null): Dayjs | null {
  if (!value) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
}

export function toApiDate(value?: Dayjs | null): string | undefined {
  return value ? value.format(DISPLAY_FORMAT) : undefined;
}

export function isExpiringSoon(nextBillingDate: string, remindBeforeDays: number): boolean {
  const billing = dayjs(nextBillingDate);
  if (!billing.isValid()) {
    return false;
  }

  return billing.diff(dayjs().startOf('day'), 'day') <= remindBeforeDays;
}
