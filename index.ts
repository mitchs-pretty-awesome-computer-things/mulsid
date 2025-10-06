import { encodeRandomness, encodeTime } from "./util";

export { monotonicMULSID } from "./monotonic";
export { decodeTimestamp } from "./util";

export function mulsid(timestamp: number = Date.now()) {
	return encodeTime(timestamp) + encodeRandomness();
}
