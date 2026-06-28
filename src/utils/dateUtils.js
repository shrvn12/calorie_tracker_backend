// src/utils/dateUtils.js
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isBetween from 'dayjs/plugin/isBetween.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

/**
 * Get start and end of a given day (UTC)
 */
export const getDayRange = (date = new Date()) => {
  const d = dayjs(date).utc();
  return {
    start: d.startOf('day').toDate(),
    end: d.endOf('day').toDate(),
  };
};

/**
 * Get start and end of a month
 */
export const getMonthRange = (year, month) => {
  const d = dayjs().year(year).month(month - 1).utc();
  return {
    start: d.startOf('month').toDate(),
    end: d.endOf('month').toDate(),
  };
};

/**
 * Format a date to YYYY-MM-DD string (UTC)
 */
export const toDateString = (date = new Date()) => dayjs(date).utc().format('YYYY-MM-DD');

/**
 * Parse a YYYY-MM-DD string into a Date object (UTC start of day)
 */
export const fromDateString = (str) => dayjs.utc(str, 'YYYY-MM-DD').startOf('day').toDate();

/**
 * Get start of N days ago (UTC)
 */
export const daysAgo = (n) => dayjs().utc().subtract(n, 'day').startOf('day').toDate();

export { dayjs };
