import crypto from "node:crypto";

const ALPHABET =
	"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" as const;
export const BASE = ALPHABET.length;
const ZERO = ALPHABET[0];
// 100ms per tick to keep timestamp as short as possible while still being able to
// generate a good number of them per second
const TICK_WIDTH = 100;

const TIMESTAMP_LENGTH = 7;
const MAX_TIMESTAMP_VALUE = BASE ** TIMESTAMP_LENGTH;
export const RANDOM_LENGTH = 3;
export const MAX_RANDOMNESS_VALUE = BASE ** RANDOM_LENGTH;
const BIT_MASK_18_BITS = 0x3ffff;

export function getTimestamp(time: number = Date.now()) {
	return Math.floor(time / TICK_WIDTH);
}

export function toBase62(value: bigint, width: number) {
	let str = "";
	const B = BigInt(BASE);
	while (value > 0n) {
		const mod = Number(value % B);
		str = ALPHABET[mod] + str;
		value = value / B;
	}
	if (str.length > width) {
		throw new Error(`Overflow: expected width ${width}, got ${str.length}`);
	}
	return str.padStart(width, ZERO);
}

export function fromBase62(str: string) {
	let n = 0n;
	const B = BigInt(BASE);
	for (const char of str) {
		const i = ALPHABET.indexOf(char);
		if (i < 0) {
			throw new Error(`Invalid base62 character: ${char}`);
		}
		n = n * B + BigInt(i);
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
	return toBase62(BigInt(timestamp), TIMESTAMP_LENGTH);
}

function random18Bits() {
	const buf = crypto.getRandomValues(new Uint8Array(RANDOM_LENGTH)); // 3 random bytes (24 bits)
	const n = buf.reduce((calc, curr, i) => {
		return calc | (curr << ((RANDOM_LENGTH - (i + 1)) * 8));
	}, 0);
	return n & BIT_MASK_18_BITS; // 18 bits, unsafe for 3 base62 chars
}

// because 3 base62 characters can only hold between 17 and 18 bits, generate a
// random 18 bit number and make sure it does not exceed the max randomness
// value that can fit into those 3 characters
function safeRandomBits() {
	let n: number;
	do {
		n = random18Bits();
	} while (n >= MAX_RANDOMNESS_VALUE);
	return n;
}

export function encodeRandomness() {
	return toBase62(BigInt(safeRandomBits()), RANDOM_LENGTH);
}

export function decodeTimestamp(id: string) {
	const time = id.slice(0, TIMESTAMP_LENGTH);
	const ticks = Number(fromBase62(time));
	return ticks * TICK_WIDTH;
}
