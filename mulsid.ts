import {
	encodeRandomness,
	encodeTime,
	fromBase62,
	getTimestamp,
	MULSID_LENGTH,
	TICK_WIDTH,
	TIMESTAMP_LENGTH,
} from "./util";

export function mulsid(timestamp: number = Date.now()) {
	return encodeTime(getTimestamp(timestamp)) + encodeRandomness();
}

export function decodeTimestamp(id: string) {
	if (id.length !== MULSID_LENGTH) {
		throw new Error(
			`Incorrect MULSID length. Should be ${MULSID_LENGTH} but is ${id.length}`,
		);
	}
	const time = id.slice(0, TIMESTAMP_LENGTH);
	const ticks = Number(fromBase62(time));
	return ticks * TICK_WIDTH;
}
