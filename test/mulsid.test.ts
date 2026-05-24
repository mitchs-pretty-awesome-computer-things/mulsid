/**
 * @copyright 2025 Mitch's Pretty Awesome Computer Things LLC
 * @author Mitchell Adair
 * @see https://github.com/mitchwadair
 * @license MIT
 */

import { describe, expect, test } from "bun:test";
import { monotonicMULSID, monotonicMULSIDFactory } from "../src/monotonic";
import { decodeTimestamp, mulsid } from "../src/mulsid";
import {
	decodePacked,
	fromBase62,
	MAX_TICK,
	MULSID_LENGTH,
	TICK_WIDTH,
} from "../src/util";
import { MAX_RANDOMNESS_VALUE } from "./util";

describe("mulsid()", () => {
	test("has correct length", () => {
		expect(mulsid().length).toEqual(MULSID_LENGTH);
	});

	test("outputs correct tick for timestamp 0", () => {
		const id = mulsid(0);
		const { tick } = decodePacked(id);
		expect(tick).toEqual(0);
	});

	test("outputs correct tick for max timestamp", () => {
		const id = mulsid(MAX_TICK * TICK_WIDTH);
		const { tick } = decodePacked(id);
		expect(tick).toEqual(MAX_TICK);
	});

	test("should fail when time is too large", () => {
		const max = MAX_TICK * TICK_WIDTH;
		const tooBig = max + TICK_WIDTH;
		expect(() => mulsid(tooBig)).toThrow();
	});

	test("should fail when time is negative", () => {
		expect(() => mulsid(-1)).toThrow();
	});
});

describe("decodeTimestamp()", () => {
	test("timestamp tick matches correct time window", () => {
		const now = Date.now();
		const id = mulsid(now);
		const actual = decodeTimestamp(id);

		expect(now).toBeGreaterThanOrEqual(actual);
		expect(now).toBeLessThan(actual + TICK_WIDTH);
	});

	test("fails with invalid MULSID length", () => {
		expect(() => decodeTimestamp("zzzz")).toThrow();
		expect(() => decodeTimestamp("z".repeat(MULSID_LENGTH + 1))).toThrow();
	});

	test("fails with invalid MULSID character", () => {
		expect(() => decodeTimestamp("zzz-zzz-zz")).toThrow();
	});
});

describe("monotonicMULSID()", () => {
	test("should increment randomness by one for same timestamp", () => {
		const factory = monotonicMULSIDFactory(() => 0);
		const id1 = factory(0);
		const id2 = factory(0);

		expect(decodePacked(id1)).toEqual({ tick: 0, randomness: 0 });
		expect(decodePacked(id2)).toEqual({ tick: 0, randomness: 1 });
	});

	test("should increment time when randomness overflows", () => {
		const factory = monotonicMULSIDFactory(() => MAX_RANDOMNESS_VALUE - 1);
		const id1 = factory(0);
		const id2 = factory(0);

		expect(decodePacked(id1)).toEqual({
			tick: 0,
			randomness: MAX_RANDOMNESS_VALUE - 1,
		});
		expect(decodePacked(id2)).toEqual({ tick: 1, randomness: 0 });
	});

	test("should encode correctly at overflow boundary", () => {
		// Verify the string values at the overflow point
		const factory = monotonicMULSIDFactory(() => MAX_RANDOMNESS_VALUE - 1);
		const id1 = factory(0);
		const id2 = factory(0);

		const expectedPacked1 = BigInt(MAX_RANDOMNESS_VALUE - 1);
		const expectedPacked2 = BigInt(MAX_RANDOMNESS_VALUE);

		expect(fromBase62(id1)).toEqual(expectedPacked1);
		expect(fromBase62(id2)).toEqual(expectedPacked2);
	});

	test("should not increment randomness for different tick", () => {
		const factory = monotonicMULSIDFactory(() => 0);
		const id1 = factory(0);
		const id2 = factory(TICK_WIDTH);

		expect(decodePacked(id1)).toEqual({ tick: 0, randomness: 0 });
		expect(decodePacked(id2)).toEqual({ tick: 1, randomness: 0 });
	});

	test("should increment for different tick without seed", () => {
		const factory = monotonicMULSIDFactory(() => 0);
		const id1 = factory();
		const id2 = factory();
		const id3 = factory();

		expect(fromBase62(id2)).toEqual(fromBase62(id1) + 1n);
		expect(fromBase62(id3)).toEqual(fromBase62(id2) + 1n);
	});

	test("timestamp tick matches correct time window", () => {
		const now = Date.now();
		const id = monotonicMULSID(now);
		const actual = decodeTimestamp(id);

		expect(now).toBeGreaterThanOrEqual(actual);
		expect(now).toBeLessThan(actual + TICK_WIDTH);
	});

	test("should overflow after exhausing 18 bits of randomness", () => {
		// Start with randomness at max; next two calls should overflow twice
		const factory = monotonicMULSIDFactory(() => MAX_RANDOMNESS_VALUE - 1);
		const id1 = factory(0); // tick=0, rand=262143
		const id2 = factory(0); // overflow: tick=1, rand=0
		const id3 = factory(0); // tick=1, rand=1

		expect(decodePacked(id1)).toEqual({
			tick: 0,
			randomness: MAX_RANDOMNESS_VALUE - 1,
		});
		expect(decodePacked(id2)).toEqual({ tick: 1, randomness: 0 });
		expect(decodePacked(id3)).toEqual({ tick: 1, randomness: 1 });
	});

	test("should handle increasing tick then same tick increment", () => {
		const factory = monotonicMULSIDFactory(() => 0);
		const id1 = factory(0); // tick=0, rand=0
		const id2 = factory(TICK_WIDTH); // tick=1, rand=0 (new tick)
		const id3 = factory(TICK_WIDTH); // tick=1, rand=1 (increment)

		expect(decodePacked(id1)).toEqual({ tick: 0, randomness: 0 });
		expect(decodePacked(id2)).toEqual({ tick: 1, randomness: 0 });
		expect(decodePacked(id3)).toEqual({ tick: 1, randomness: 1 });
	});
});
