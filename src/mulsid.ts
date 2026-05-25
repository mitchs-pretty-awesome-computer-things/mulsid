import {
	decodePacked,
	encodePacked,
	getTimestamp,
	randomBits,
	TICK_WIDTH,
} from "./util";

/**
 * Generates a MULSID (Mini Unique Lexicographically-Sortable ID).
 *
 * The ID is a 10-character base62 string containing a bit-packed
 * timestamp tick (upper portion) and 18 bits of randomness (lower portion).
 * The tick is derived from the current time (or a provided timestamp)
 * using the configured tick width (9 ms).
 *
 * @param timestamp A millisecond timestamp (defaults to `Date.now()`).
 * @returns A 10-character base62 MULSID.
 * @throws {RangeError} If the timestamp produces a tick outside the valid range.
 */
export function mulsid(timestamp: number = Date.now()): string {
	return encodePacked(getTimestamp(timestamp), randomBits());
}

/**
 * Extracts the approximate millisecond timestamp from a MULSID.
 *
 * The returned value is the tick multiplied by the tick width (9 ms)
 * and represents the lower bound of the time window that produced the ID.
 *
 * @param id A 10-character base62 MULSID.
 * @returns The approximate Unix millisecond timestamp.
 * @throws {Error} If the ID has an invalid length or contains invalid characters.
 */
export function decodeTimestamp(id: string): number {
	return decodePacked(id).tick * TICK_WIDTH;
}
