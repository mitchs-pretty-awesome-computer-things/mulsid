/**
 * @copyright 2025 Mitch's Pretty Awesome Computer Things LLC
 * @author Mitchell Adair
 * @see https://github.com/mitchwadair
 * @license MIT
 */

const ALPHABET =
	"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" as const;
const ZERO = ALPHABET[0];

export const BASE = ALPHABET.length;
export const TIMESTAMP_LENGTH = 7;
export const MAX_TIMESTAMP_VALUE = BASE ** TIMESTAMP_LENGTH - 1;
export const RANDOM_LENGTH = 3;
export const MAX_RANDOMNESS_VALUE = BASE ** RANDOM_LENGTH;
export const MULSID_LENGTH = TIMESTAMP_LENGTH + RANDOM_LENGTH;

const THOUSAND_YEARS = 1000 * 60 * 60 * 24 * 365.25 * 1000; // a thousand years in ms
// minimum ms per tick to be able to fit to TIMESTAMP_LENGTH and also generate
// as many IDs as possible per-second with minimal collision risk
export const TICK_WIDTH = Math.ceil(THOUSAND_YEARS / MAX_TIMESTAMP_VALUE);

const BITS_FOR_RANDOMNESS = Math.ceil(Math.log2(MAX_RANDOMNESS_VALUE));
const BIT_MASK = (1 << BITS_FOR_RANDOMNESS) - 1;

export function getTimestamp(time: number = Date.now()) {
	return Math.floor(time / TICK_WIDTH);
}

export function toBase62(value: number, width: number) {
	let str = "";
	let remaining = value;
	while (remaining > 0) {
		const mod = remaining % BASE;
		str = ALPHABET[mod] + str;
		remaining = Math.floor(remaining / BASE);
	}
	if (str.length > width) {
		throw new Error(`Overflow: expected width ${width}, got ${str.length}`);
	}
	return str.padStart(width, ZERO);
}

export function fromBase62(str: string) {
	let n = 0;
	for (const char of str) {
		const i = ALPHABET.indexOf(char);
		if (i < 0) {
			throw new Error(`Invalid base62 character: ${char}`);
		}
		n = n * BASE + i;
	}
	return n;
}

export function encodeTime(timestamp: number) {
	if (
		!Number.isInteger(timestamp) ||
		timestamp < 0 ||
		timestamp > MAX_TIMESTAMP_VALUE
	) {
		throw new RangeError(
			`Invalid timestamp: ${timestamp}. Value must be a positive integer less than ${MAX_TIMESTAMP_VALUE}`,
		);
	}
	return toBase62(timestamp, TIMESTAMP_LENGTH);
}

function unsafeRandomBits() {
	const buf = crypto.getRandomValues(new Uint8Array(RANDOM_LENGTH)); // RANDOM_LENGTH random bytes (RANDOM_LENGTH * 8 bits)
	const n = buf.reduce((calc, curr, i) => {
		return calc | (curr << ((RANDOM_LENGTH - (i + 1)) * 8));
	}, 0);
	return n & BIT_MASK; // BITS_FOR_RANDOMNESS bits, possibly unsafe for RANDOM_LENGTH base62 chars
}

// because RANDOM_LENGTH base62 characters can only hold between
// BITS_FOR_RANDOMNESS - 1 and BITS_FOR_RANDOMNESS bits, generate a random
// BITS_FOR_RANDOMNESS bit number and make sure it does not exceed
// MAX_RANDOMNESS_VALUE that can fit into those characters
function safeRandomBits() {
	let n: number;
	do {
		n = unsafeRandomBits();
	} while (n >= MAX_RANDOMNESS_VALUE);
	return n;
}

export function encodeRandomness() {
	return toBase62(safeRandomBits(), RANDOM_LENGTH);
}
