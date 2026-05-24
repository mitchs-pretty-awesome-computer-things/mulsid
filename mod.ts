/**
 * @copyright 2025 Mitch's Pretty Awesome Computer Things LLC
 * @author Mitchell Adair
 * @see https://github.com/mitchwadair
 * @license MIT
 * @module mulsid
 *
 * MULSID — Mini Unique Lexicographically-Sortable IDs.
 *
 * MULSID produces 10-character base62 IDs using a BP-18-9 layout:
 * a bit-packed integer with an 18-bit randomness value and a timestamp
 * tick derived from 9 ms increments.
 */

export { monotonicMULSID } from "./src/monotonic";
export { decodeTimestamp, mulsid } from "./src/mulsid";
