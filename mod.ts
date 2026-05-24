/**
 * @module mulsid
 *
 * MULSID — Mini Unique Lexicographically-Sortable IDs.
 *
 * MULSID produces 10-character base62 IDs using a bit-packed integer
 * a bit-packed integer with an 18-bit randomness value and a timestamp
 * tick derived from 9 ms increments.
 */

export { monotonicMULSID } from "./src/monotonic";
export { decodeTimestamp, mulsid } from "./src/mulsid";
