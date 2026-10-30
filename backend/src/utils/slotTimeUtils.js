/**
 * Utility functions for parsing, validating, and filtering campus pickup slots.
 * Ensures strict dynamic local system timezone comparisons without hardcoded values.
 */

// Formats a Date object as YYYY-MM-DD in local system timezone
export function formatLocalDate(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parses a time string like "10:00 AM", "2:30 PM", "14:00" into { hours, minutes }
export function parseTimeComponent(timeStr) {
  if (!timeStr) return null;
  const match = String(timeStr).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridian = match[3] ? match[3].toUpperCase() : null;

  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}

/**
 * Parses slot date and time into start and end Date objects in the local system timezone.
 * Supports:
 * - Date: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, MM/DD/YYYY, 'today', 'tomorrow', or ISO/date strings
 * - Time: "10:00 AM – 11:00 AM", "10:00 AM - 11:00 AM", "10:00 AM to 11:00 AM", "10:00 AM", "14:00"
 */
export function parseSlotDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;

  const now = new Date();
  let year, month, day;

  const cleanDate = String(dateStr).trim();
  const lowerDate = cleanDate.toLowerCase();

  if (lowerDate === 'today') {
    year = now.getFullYear();
    month = now.getMonth() + 1;
    day = now.getDate();
  } else if (lowerDate === 'tomorrow') {
    const tm = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    year = tm.getFullYear();
    month = tm.getMonth() + 1;
    day = tm.getDate();
  } else {
    const isoMatch = cleanDate.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    const dmyMatch = cleanDate.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

    if (isoMatch) {
      year = parseInt(isoMatch[1], 10);
      month = parseInt(isoMatch[2], 10);
      day = parseInt(isoMatch[3], 10);
    } else if (dmyMatch) {
      day = parseInt(dmyMatch[1], 10);
      month = parseInt(dmyMatch[2], 10);
      year = parseInt(dmyMatch[3], 10);
    } else {
      const d = new Date(cleanDate);
      if (isNaN(d.getTime())) return null;
      year = d.getFullYear();
      month = d.getMonth() + 1;
      day = d.getDate();
    }
  }

  // Split time range (supporting en-dash, em-dash, hyphen, or 'to')
  const parts = String(timeStr).split(/[\u2013\u2014\-]|(?:\s+to\s+)/i);
  const startPart = parts[0]?.trim();
  const endPart = parts[1]?.trim() || startPart;

  const startParsed = parseTimeComponent(startPart);
  const endParsed = parseTimeComponent(endPart);

  if (!startParsed) return null;

  const start = new Date(year, month - 1, day, startParsed.hours, startParsed.minutes, 0, 0);
  const end = endParsed
    ? new Date(year, month - 1, day, endParsed.hours, endParsed.minutes, 0, 0)
    : new Date(start.getTime() + 60 * 60 * 1000);

  return { start, end, isValid: true };
}

/**
 * Checks if a slot has expired relative to a reference time (defaults to system clock).
 * A slot is considered expired if its scheduled start time has arrived or passed.
 */
export function isSlotExpired(slot, referenceTime = new Date()) {
  if (!slot) return true;
  const parsed = parseSlotDateTime(slot.date, slot.time);
  if (!parsed || !parsed.isValid) return true;

  const now = new Date(referenceTime);
  return parsed.start.getTime() <= now.getTime();
}

/**
 * Checks if a slot is strictly in the future.
 */
export function isSlotInFuture(slot, referenceTime = new Date()) {
  return !isSlotExpired(slot, referenceTime);
}

/**
 * Filters an array of slots to only include future upcoming slots.
 * Automatically sorts chronologically ascending.
 */
export function filterFutureSlots(slots = [], referenceTime = new Date()) {
  if (!Array.isArray(slots)) return [];
  const now = new Date(referenceTime);

  return slots
    .filter((slot) => isSlotInFuture(slot, now))
    .sort((a, b) => {
      const pA = parseSlotDateTime(a.date, a.time);
      const pB = parseSlotDateTime(b.date, b.time);
      if (!pA || !pB) return 0;
      return pA.start.getTime() - pB.start.getTime();
    });
}

/**
 * Dynamically generates upcoming campus store pickup slots for a given number of days.
 * Never relies on hardcoded dates — calculates dynamically from the system clock.
 */
export function generateUpcomingSlots(startDate = new Date(), daysAhead = 2) {
  const slots = [];
  const standardHours = [
    { time: '09:00 AM – 10:00 AM', startH: 9, startM: 0 },
    { time: '10:00 AM – 11:00 AM', startH: 10, startM: 0 },
    { time: '11:00 AM – 12:00 PM', startH: 11, startM: 0 },
    { time: '02:00 PM – 03:00 PM', startH: 14, startM: 0 },
    { time: '03:00 PM – 04:00 PM', startH: 15, startM: 0 },
    { time: '04:00 PM – 05:00 PM', startH: 16, startM: 0 },
  ];

  const now = new Date(startDate);

  for (let d = 0; d < daysAhead; d++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
    const dateStr = formatLocalDate(targetDate);

    for (const h of standardHours) {
      const slotStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), h.startH, h.startM, 0, 0);

      // Only include if in the future relative to now
      if (slotStart.getTime() > now.getTime()) {
        slots.push({
          id: `dyn-${dateStr}-${h.startH}`,
          date: dateStr,
          time: h.time,
          capacity: 20,
          booked: 0,
          isDynamicallyGenerated: true,
        });
      }
    }
  }

  return slots;
}

