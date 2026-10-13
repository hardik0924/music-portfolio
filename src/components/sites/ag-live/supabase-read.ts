/**
 * Read-only PostgREST client for the AG Live data the source page reads at runtime.
 *
 * The upstream site ships this project's public anon key in its own HTML, so the
 * clone reads the same public tables and stays in sync. Nothing here writes: the
 * source's two write paths (Supabase review insert and the formsubmit.co booking
 * POST) are handled locally instead — see the delivery notes.
 */

const SUPABASE_URL = "https://vqaxatmtomngjffilgtc.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxYXhhdG10b21uZ2pmZmlsZ3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNTM3NTAsImV4cCI6MjA5NTkyOTc1MH0.9QJpJpL-gUux88RpWKwX9nemORAZYJI1SQ-dyFezTVk";

const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

const ARTIST_FILTER = "artist=ilike.*AMIT%20GAUR*";
const ACTIVE_FILTER = "status=neq.cancelled";

export type BookingRow = {
  date: number | null;
  month: number | null;
  year: number | null;
  day: string | null;
  venue: string | null;
  slot: string | null;
  type: string | null;
  status: string | null;
};

export type RemoteReview = { name: string | null; review: string | null };

export type Result<T> = { ok: true; data: T } | { ok: false };

async function getJson<T>(path: string, signal?: AbortSignal): Promise<Result<T>> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: HEADERS,
      signal,
    });
    if (!res.ok) return { ok: false };
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return { ok: false };
    return { ok: true, data: data as T };
  } catch {
    return { ok: false };
  }
}

/** Confirmed bookings for a rolling window of months, used by the "Shows" list. */
export function fetchBookings(
  year: number,
  months: number[],
  signal?: AbortSignal,
): Promise<Result<BookingRow[]>> {
  const params = new URLSearchParams({
    select: "date,month,year,day,venue,slot,type,status",
    order: "year.asc,month.asc,date.asc",
    limit: "50",
  });
  const query =
    `bookings?${params.toString()}` +
    `&${ARTIST_FILTER}&${ACTIVE_FILTER}` +
    `&year=eq.${year}&month=in.(${months.join(",")})`;
  return getJson<BookingRow[]>(query, signal);
}

/** Day-of-month numbers that already have a confirmed show, for the calendar. */
export function fetchBookedDates(
  year: number,
  month: number,
  signal?: AbortSignal,
): Promise<Result<number[]>> {
  const query =
    "bookings?select=date" +
    `&${ARTIST_FILTER}&${ACTIVE_FILTER}` +
    `&year=eq.${year}&month=eq.${month}&limit=60`;
  return getJson<{ date: number | null }[]>(query, signal).then((result) =>
    result.ok
      ? { ok: true, data: result.data.map((row) => Number(row.date)).filter(Number.isFinite) }
      : result,
  );
}

/** Approved reviews, newest first, exactly as the source carousel requests them. */
export function fetchApprovedReviews(
  signal?: AbortSignal,
): Promise<Result<RemoteReview[]>> {
  return getJson<RemoteReview[]>(
    "amitgaur_reviews?select=name,review&approved=eq.true&order=created_at.desc&limit=20",
    signal,
  );
}