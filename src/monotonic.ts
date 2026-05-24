import {
	getTimestamp,
	MAX_MULSID_VALUE,
	MULSID_LENGTH,
	RANDOMNESS_BITS,
	randomBits,
	toBase62,
} from "./util";

/**
 * Creates a monotonic MULSID factory function.
 *
 * The returned function guarantees that successive IDs (within the same
 * process) are strictly increasing lexicographically, even when multiple
 * IDs are generated within the same timestamp tick. It does this by
 * incrementing the packed integer value when the current tick matches
 * the last used tick.
 *
 * If the 18-bit randomness portion overflows (exceeds 2^18 - 1), the
 * timestamp tick is automatically incremented by 1 and the randomness
 * wraps back to 0.
 *
 * @param randomGenerator Optional function that returns a random value
 *                        in [0, 2^RANDOMNESS_BITS). Defaults to a
 *                        cryptographically secure random generator.
 * @returns A function that generates monotonic MULSID strings.
 */
export function monotonicMULSIDFactory(
	randomGenerator: () => number = randomBits,
) {
	let lastPacked = -1n;

	return function mulsid(timestamp: number = Date.now()): string {
		const currentTick = getTimestamp(timestamp);
		const lastTick = Number(lastPacked >> BigInt(RANDOMNESS_BITS));

		if (currentTick > lastTick) {
			lastPacked =
				(BigInt(currentTick) << BigInt(RANDOMNESS_BITS)) |
				BigInt(randomGenerator());
		} else {
			lastPacked += 1n;
		}

		if (lastPacked > MAX_MULSID_VALUE) {
			throw new Error("MULSID overflow: cannot generate more unique IDs");
		}

		return toBase62(lastPacked, MULSID_LENGTH);
	};
}

const mulsid = monotonicMULSIDFactory();

/**
 * Generates a monotonic MULSID using a shared factory.
 *
 * This is a convenience wrapper around a default
 * {@linkcode monotonicMULSIDFactory} instance.
 *
 * @param timestamp A millisecond timestamp (defaults to `Date.now()`).
 * @returns A 10-character base62 MULSID that is guaranteed to be
 *          lexicographically greater than any previously generated ID
 *          from this function.
 */
export function monotonicMULSID(timestamp: number = Date.now()): string {
	return mulsid(timestamp);
}
