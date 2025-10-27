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
	MAX_TIMESTAMP_VALUE,
	MULSID_LENGTH,
	TICK_WIDTH,
	TIMESTAMP_LENGTH,
} from "../src/util";

describe("mulsid()", () => {
	test("has correct length", () => {
		expect(mulsid().length).toEqual(MULSID_LENGTH);
	});

	test("outputs correct timestamp encoding", () => {
		const idZero = mulsid(0);
		const timestampSegmentZero = idZero.substring(0, TIMESTAMP_LENGTH);
		expect(timestampSegmentZero).toEqual("0000000");

		const idMax = mulsid(MAX_TIMESTAMP_VALUE * TICK_WIDTH);
		const timestampSegmentMax = idMax.substring(0, TIMESTAMP_LENGTH);
		expect(timestampSegmentMax).toEqual("zzzzzzz");
	});

	test("should fail when time is too large", () => {
		const max = MAX_TIMESTAMP_VALUE * TICK_WIDTH;
		const tooBig = max + TICK_WIDTH;
		expect(() => mulsid(max)).not.toThrow();
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
		expect(() => decodeTimestamp("zzzzzzzzzzz")).toThrow();
	});

	test("fails with invalid MULSID character", () => {
		expect(() => decodeTimestamp("zzz-zzz-zz")).toThrow();
	});
});

describe("monotonicMULSID()", () => {
	test("should increment randomness by one for same timestamp", () => {
		const mulsidStub = monotonicMULSIDFactory(() => "000");
		const id1 = mulsidStub(0);
		const id2 = mulsidStub(0);

		expect(id1).toEqual("0000000000");
		expect(id2).toEqual("0000000001");
	});

	test("should properly increment each char of randomness", () => {
		const mulsidStub1 = monotonicMULSIDFactory(() => "00z");
		const id1 = mulsidStub1(0);
		const id2 = mulsidStub1(0);

		expect(id1).toEqual("000000000z");
		expect(id2).toEqual("0000000010");

		const mulsidStub2 = monotonicMULSIDFactory(() => "0zz");
		const id3 = mulsidStub2(0);
		const id4 = mulsidStub2(0);

		expect(id3).toEqual("00000000zz");
		expect(id4).toEqual("0000000100");
	});

	test("should increment time when randomness overflows", () => {
		const mulsidStub = monotonicMULSIDFactory(() => "zzz");
		const id1 = mulsidStub(0);
		const id2 = mulsidStub(0);

		expect(id1).toEqual("0000000zzz");
		expect(id2).toEqual("0000001zzz");
	});

	test("should not increment randomness for different tick", () => {
		const mulsidStub = monotonicMULSIDFactory(() => "000");
		const id1 = mulsidStub(0);
		const id2 = mulsidStub(TICK_WIDTH);

		expect(id1).toEqual("0000000000");
		expect(id2).toEqual("0000001000");
	});

	test("should increment randomness for different tick without seed", () => {
		const mulsidStub = monotonicMULSIDFactory(() => "000");
		const id1 = mulsidStub();
		const id2 = mulsidStub();
		const id3 = mulsidStub();

		expect(id1).toEndWith("000");
		expect(id2).toEndWith("001");
		expect(id3).toEndWith("002");
	});

	test("timestamp tick matches correct time window", () => {
		const now = Date.now();
		const id = monotonicMULSID(now);
		const actual = decodeTimestamp(id);

		expect(now).toBeGreaterThanOrEqual(actual);
		expect(now).toBeLessThan(actual + TICK_WIDTH);
	});
});
