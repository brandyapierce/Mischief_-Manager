const NEW_WORKDAY_HOUR = 7;
const OPEN_DAYS = new Set([0, 3, 4, 5, 6]);
const OPEN_MINUTES = 11 * 60;
const CLOSE_MINUTES = 16 * 60;

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getWorkdayDate(value = new Date()) {
  const date = new Date(value);
  const workday = startOfDay(date);

  if (date.getHours() < NEW_WORKDAY_HOUR) {
    workday.setDate(workday.getDate() - 1);
  }

  return workday;
}

export function formatWorkdayDate(value = new Date()) {
  return getWorkdayDate(value).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getOperatingStatus(value = new Date()) {
  const date = new Date(value);
  const minutes = date.getHours() * 60 + date.getMinutes();
  const isOpenDay = OPEN_DAYS.has(date.getDay());
  const isOpen = isOpenDay && minutes >= OPEN_MINUTES && minutes < CLOSE_MINUTES;

  if (!isOpenDay) {
    return { state: 'closed', label: 'Sanctuary closed', reason: 'Public hours are Wednesday through Sunday.' };
  }

  if (minutes < OPEN_MINUTES) {
    return { state: 'pre_open', label: 'Before public hours', reason: 'Public hours begin at 11:00 AM.' };
  }

  if (minutes >= CLOSE_MINUTES) {
    return { state: 'after_hours', label: 'After public hours', reason: 'Public hours ended at 4:00 PM.' };
  }

  return { state: 'open', label: 'Sanctuary open', reason: 'Public hours are 11:00 AM to 4:00 PM.' };
}
