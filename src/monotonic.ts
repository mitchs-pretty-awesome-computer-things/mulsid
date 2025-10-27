/**
 * @copyright 2025 Mitch's Pretty Awesome Computer Things LLC
 * @author Mitchell Adair
 * @see https://github.com/mitchwadair
 * @license MIT
 */

import {
	encodeRandomness,
	encodeTime,
	fromBase62,
	getTimestamp,
	MAX_RANDOMNESS_VALUE,
	RANDOM_LENGTH,
	toBase62,
} from "./util";

function incrementRandomness(rand: string) {
	const value = fromBase62(rand);
	const incremented = value + 1;
	if (incremented >= MAX_RANDOMNESS_VALUE) {
		throw new Error("Randomness overflowed");
	}
	return toBase62(incremented, RANDOM_LENGTH);
}

export function monotonicMULSIDFactory(
	randomGenerator: () => string = encodeRandomness,
) {
	let lastTick = -1;
	let lastRand = "";
	return function mulsid(timestamp: number = Date.now()) {
		const time = getTimestamp(timestamp);
		if (time <= lastTick) {
			try {
				lastRand = incrementRandomness(lastRand);
			} catch {
				lastRand = randomGenerator();
				lastTick = lastTick + 1;
			}
		} else {
			lastRand = randomGenerator();
			lastTick = time;
		}

		return encodeTime(lastTick) + lastRand;
	};
}

const mulsid = monotonicMULSIDFactory();

export function monotonicMULSID(timestamp: number = Date.now()): string {
	return mulsid(timestamp);
}
