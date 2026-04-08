export function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function safeString(value) {
  return value == null ? '' : String(value);
}

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function buildAvailableDates(service, today = new Date()) {
  const source = safeObject(service);
  if (Object.keys(source).length === 0) {
    return [];
  }
  const minBookingDays = Math.max(0, safeNumber(source.min_booking_days, 0));
  const maxBookingDays = Math.max(minBookingDays, safeNumber(source.max_booking_days, minBookingDays));
  const dates = [];

  for (let offset = minBookingDays; offset <= maxBookingDays; offset += 1) {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    dates.push(toIsoDate(date));
  }

  return dates;
}

function extractApiPayload(value) {
  if (Array.isArray(value)) {
    return value;
  }

  const source = safeObject(value);
  if (Array.isArray(source.data)) {
    return source.data;
  }

  if (source.data && typeof source.data === 'object' && !Array.isArray(source.data)) {
    return source.data;
  }

  return source;
}

function normalizeVerificationState(value) {
  if (typeof value === 'boolean') {
    return value ? 'verified' : 'pending';
  }

  return safeString(value);
}

export function normalizeReservationSummary(value) {
  const summary = safeObject(value);
  return {
    reservationNumber: safeString(summary.reservationNumber),
    typeName: safeString(summary.typeName),
    branchName: safeString(summary.branchName),
    date: safeString(summary.date),
    slotLabel: safeString(summary.slotLabel),
    applicantName: safeString(summary.applicantName),
    applicantPhone: safeString(summary.applicantPhone),
    applicantEmail: safeString(summary.applicantEmail)
  };
}

export function normalizeReservationVerification(value) {
  const verification = safeObject(value);
  return {
    state: normalizeVerificationState(verification.state ?? verification.verified),
    email: safeString(verification.email)
  };
}

export function normalizeReservationLookup(value, fallbackContact = '') {
  const lookup = safeObject(value);
  const service = safeObject(lookup.service);

  return {
    reservationNumber: safeString(lookup.reservationNumber ?? lookup.id),
    email: safeString(lookup.email ?? lookup.customer_email ?? fallbackContact),
    typeName: safeString(lookup.typeName ?? service.name),
    branchName: safeString(lookup.branchName),
    date: safeString(lookup.date ?? lookup.booking_date),
    slotLabel: safeString(lookup.slotLabel ?? lookup.booking_time),
    state: safeString(lookup.state ?? lookup.status)
  };
}

export function normalizeReservationComplete(value) {
  const complete = safeObject(value);
  return {
    notice: safeString(complete.notice)
  };
}

export function normalizeReservationData(value) {
  const source = safeObject(value);
  const reservationPayload = extractApiPayload(source.reservation ?? source);
  const verificationPayload = extractApiPayload(source.reservation_verification ?? source.verification ?? {});
  const consultationTypes = safeArray(reservationPayload).map((item) => safeObject(item));
  const selectedConsultationTypeId = source._local?.selectedConsultationTypeId ?? null;
  const selectedConsultationType = consultationTypes.find((item) => String(item.id ?? '') === String(selectedConsultationTypeId ?? ''))
    ?? consultationTypes[0]
    ?? {};
  const normalizedVerification = normalizeReservationVerification(verificationPayload);
  const normalizedLookup = Object.keys(safeObject(source.lookup)).length > 0
    ? normalizeReservationLookup(source.lookup, safeString(source.query?.customer_phone))
    : normalizeReservationLookup(safeArray(reservationPayload)[0], safeString(source.query?.customer_phone));

  return {
    consultation_types: consultationTypes,
    branches: safeArray(source.branches),
    available_dates: safeArray(source.available_dates).length > 0 ? safeArray(source.available_dates) : buildAvailableDates(selectedConsultationType),
    available_slots: safeArray(source.available_slots?.slots ?? source.available_slots),
    summary: normalizeReservationSummary(source.summary),
    lookup: normalizedLookup,
    verification: normalizedVerification,
    complete: normalizeReservationComplete(source.complete),
    state: safeString(source.state || normalizedVerification.state)
  };
}

export function normalizeAdminReservationDetail(value) {
  const detail = safeObject(value);
  return {
    id: safeString(detail.id),
    reservationNumber: safeString(detail.reservationNumber),
    applicantName: safeString(detail.applicantName),
    applicantPhone: safeString(detail.applicantPhone),
    applicantEmail: safeString(detail.applicantEmail),
    consultationType: safeString(detail.consultationType),
    branchName: safeString(detail.branchName),
    reservationDate: safeString(detail.reservationDate),
    slotLabel: safeString(detail.slotLabel),
    state: safeString(detail.state),
    verificationState: safeString(detail.verificationState),
    createdAt: safeString(detail.createdAt),
    updatedAt: safeString(detail.updatedAt),
    memo: safeString(detail.memo)
  };
}

export function normalizeAdminData(value) {
  const admin = safeObject(value);
  return {
    reservations: safeArray(admin.reservations).map((item) => normalizeAdminReservationDetail(item)),
    reservation_detail: normalizeAdminReservationDetail(admin.reservation_detail)
  };
}

export function createBindingContext(source) {
  const context = safeObject(source);
  return {
    reservation: normalizeReservationData(context),
    admin: normalizeAdminData(context.admin ?? context)
  };
}

export const bindingAdapters = {
  reservation: {
    consultation_types: (context) => createBindingContext(context).reservation.consultation_types,
    branches: (context) => createBindingContext(context).reservation.branches,
    available_dates: (context) => createBindingContext(context).reservation.available_dates,
    available_slots: (context) => createBindingContext(context).reservation.available_slots,
    summary: (context) => createBindingContext(context).reservation.summary,
    lookup: (context) => createBindingContext(context).reservation.lookup,
    verification: (context) => createBindingContext(context).reservation.verification,
    complete: (context) => createBindingContext(context).reservation.complete,
    state: (context) => createBindingContext(context).reservation.state
  },
  admin: {
    reservations: (context) => createBindingContext(context).admin.reservations,
    reservation_detail: (context) => createBindingContext(context).admin.reservation_detail
  }
};
