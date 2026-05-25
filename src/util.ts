const ALPHABET =
	"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" as const;
const ZERO = ALPHABET[0];

/** Number of unique digits in base62 (0-9, A-Z, a-z). */
export const BASE = BigInt(ALPHABET.length);

/** Total length of a MULSID in characters. */
export const MULSID_LENGTH = 10;

/** Milliseconds per timestamp tick. */
export const TICK_WIDTH = 9;

/** Number of randomness bits packed into each ID. */
export const RANDOMNESS_BITS = 18;

/** Bit mask for extracting randomness bits. */
const RANDOMNESS_MASK = (1 << RANDOMNESS_BITS) - 1;

/** Epoch offset in milliseconds (Unix epoch). */
export const EPOCH = 0;

/** Maximum value representable in 10 base62 characters. */
export const MAX_MULSID_VALUE = BASE ** 10n - 1n;

/**
 * Maximum allowed timestamp tick.
 * Derived from MAX_MULSID_VALUE - RANDOMNESS_MASK, then right-shifted by RANDOMNESS_BITS.
 * This gives the maximum tick such that (tick << RANDOMNESS_BITS) | RANDOMNESS_MASK
 * still fits within MAX_MULSID_VALUE.
 */
export const MAX_TICK = Number(
	(MAX_MULSID_VALUE - BigInt(RANDOMNESS_MASK)) >> BigInt(RANDOMNESS_BITS),
);

/**
 * Computes the timestamp tick for a given millisecond time.
 * @param time Millisecond timestamp (defaults to `Date.now()`).
 * @throws If the resulting tick is not a non-negative integer within the valid range.
 * @returns The tick number relative to the configured epoch.
 */
export function getTimestamp(time: number = Date.now()): number {
	const tick = Math.floor((time - EPOCH) / TICK_WIDTH);
	if (tick < 0 || tick > MAX_TICK) {
		throw new RangeError(
			`Invalid timestamp: ${time}. Resulting tick ${tick} exceeds range [0, ${MAX_TICK}]`,
		);
	}
	return tick;
}

/**
 * Encodes a non-negative bigint value into a base62 string of the given width.
 * @throws If the encoded value exceeds the specified width.
 */
export function toBase62(value: bigint, width: number): string {
	let str = "";
	let remaining = value;
	while (remaining > 0n) {
		const mod = Number(remaining % BASE);
		str = ALPHABET[mod] + str;
		remaining /= BASE;
	}
	if (str.length > width) {
		throw new Error(`Overflow: expected width ${width}, got ${str.length}`);
	}
	return str.padStart(width, ZERO);
}

/**
 * Decodes a base62 string into a bigint.
 * @throws If the string contains an invalid character.
 */
export function fromBase62(str: string): bigint {
	let n = 0n;
	for (const char of str) {
		const i = ALPHABET.indexOf(char);
		if (i < 0) {
			throw new Error(`Invalid base62 character: ${char}`);
		}
		n = n * BASE + BigInt(i);
	}
	return n;
}

/**
 * Packs a timestamp tick and randomness value into a bigint.
 * @param tick The timestamp tick (0 to MAX_TICK).
 * @param randomness The randomness value (0 to 2^RANDOMNESS_BITS - 1).
 * @returns A bigint representing the packed tick and randomness.
 */
export function packBits(tick: number, randomness: number): bigint {
	return (BigInt(tick) << BigInt(RANDOMNESS_BITS)) | BigInt(randomness);
}

/**
 * Packs a timestamp tick and randomness value into a 10-character MULSID.
 * @param tick The timestamp tick (0 to MAX_TICK).
 * @param randomness The randomness value (0 to 2^RANDOMNESS_BITS - 1).
 * @returns A 10-character base62-encoded MULSID.
 * @throws If tick or randomness are out of range.
 */
export function encodePacked(tick: number, randomness: number): string {
	if (!Number.isInteger(tick) || tick < 0 || tick > MAX_TICK) {
		throw new RangeError(
			`Invalid tick: ${tick}. Must be an integer between 0 and ${MAX_TICK}`,
		);
	}
	return toBase62(packBits(tick, randomness), MULSID_LENGTH);
}

/**
 * Decodes a 10-character MULSID into its tick and randomness components.
 * @param id A 10-character base62-encoded MULSID.
 * @returns An object with `tick` and `randomness` numbers.
 * @throws If the ID has an invalid length or contains invalid characters.
 */
export function decodePacked(id: string): { tick: number; randomness: number } {
	if (id.length !== MULSID_LENGTH) {
		throw new Error(
			`Incorrect MULSID length. Should be ${MULSID_LENGTH} but is ${id.length}`,
		);
	}
	const packed = fromBase62(id);
	const tick = Number(packed >> BigInt(RANDOMNESS_BITS));
	const randomness = Number(packed & BigInt(RANDOMNESS_MASK));
	return { tick, randomness };
}

/**
 * Generates a cryptographically random value in [0, 2^RANDOMNESS_BITS).
 * Since 2^RANDOMNESS_BITS is a power of two, no rejection sampling is needed.
 */
export function randomBits(): number {
	const bytes = crypto.getRandomValues(new Uint8Array(3));
	return ((bytes[0]! << 16) | (bytes[1]! << 8) | bytes[2]!) & RANDOMNESS_MASK;
}
