/**
 * @copyright 2025 Mitch's Pretty Awesome Computer Things LLC
 * @author Mitchell Adair
 * @see https://github.com/mitchwadair
 * @license MIT
 */

import { describe, expect, test } from "bun:test";
import {
	BASE,
	decodePacked,
	encodePacked,
	fromBase62,
	getTimestamp,
	MAX_MULSID_VALUE,
	MAX_TICK,
	MULSID_LENGTH,
	RANDOMNESS_BITS,
	toBase62,
} from "../src/util";
import { MAX_RANDOMNESS_VALUE } from "./util";

describe("getTimestamp()", () => {
	test("should return an integer", () => {
		expect(getTimestamp()).toBeInteger();
		expect(getTimestamp(1.1)).toBeInteger();
	});
});

describe("toBase62()", () => {
	test("should encode to base62", () => {
		expect(toBase62(0n, 3)).toEqual("000");
		expect(toBase62(BigInt(BASE ** 3 - 1), 3)).toEqual("zzz");
	});

	test("should fail when width is too small for given number", () => {
		const width = 4;
		const tooBig = BigInt(BASE ** width);
		expect(() => toBase62(tooBig, width)).toThrow();
	});

	test("should handle full MULSID range", () => {
		expect(toBase62(0n, MULSID_LENGTH)).toEqual("0".repeat(MULSID_LENGTH));
		expect(toBase62(MAX_MULSID_VALUE, MULSID_LENGTH)).toEqual(
			"z".repeat(MULSID_LENGTH),
		);
	});
});

describe("fromBase62()", () => {
	test("should decode from base62", () => {
		expect(fromBase62("000")).toEqual(0n);
		expect(fromBase62("zzz")).toEqual(BigInt(BASE ** 3 - 1));
	});

	test("should fail when encountering invalid base62 character", () => {
		expect(() => fromBase62("!00")).toThrow();
	});

	test("should round-trip with toBase62", () => {
		const value = BigInt(BASE ** 7 - 1);
		expect(fromBase62(toBase62(value, 7))).toEqual(value);
	});
});

describe("encodePacked()", () => {
	test("should have correct length", () => {
		expect(encodePacked(getTimestamp(), 0).length).toEqual(MULSID_LENGTH);
	});

	test("should encode tick 0 with randomness 0", () => {
		const id = encodePacked(0, 0);
		expect(id).toEqual("0".repeat(MULSID_LENGTH));
	});

	test("should encode max tick with max randomness", () => {
		const id = encodePacked(MAX_TICK, MAX_RANDOMNESS_VALUE - 1);
		expect(id.length).toEqual(MULSID_LENGTH);
		expect(decodePacked(id)).toEqual({
			tick: MAX_TICK,
			randomness: MAX_RANDOMNESS_VALUE - 1,
		});
	});

	test("should encode zero tick with max randomness", () => {
		const id = encodePacked(0, MAX_RANDOMNESS_VALUE - 1);
		expect(id.length).toEqual(MULSID_LENGTH);
		expect(decodePacked(id)).toEqual({
			tick: 0,
			randomness: MAX_RANDOMNESS_VALUE - 1,
		});
	});

	test("should fail if tick is not integer", () => {
		expect(() => encodePacked(1.1, 0)).toThrow();
	});

	test("should fail if tick is less than zero", () => {
		expect(() => encodePacked(-1, 0)).toThrow();
	});

	test("should fail if tick exceeds MAX_TICK", () => {
		expect(() => encodePacked(MAX_TICK + 1, 0)).toThrow();
	});
});

describe("decodePacked()", () => {
	test("should decode zero tick and randomness", () => {
		expect(decodePacked("0".repeat(MULSID_LENGTH))).toEqual({
			tick: 0,
			randomness: 0,
		});
	});

	test("should decode max MULSID value", () => {
		const fullId = "z".repeat(MULSID_LENGTH);
		const { tick, randomness } = decodePacked(fullId);
		expect(tick).toBeGreaterThan(0);
		expect(randomness).toBeGreaterThan(0);
		expect(fromBase62(fullId)).toEqual(MAX_MULSID_VALUE);
	});

	test("should fail with invalid MULSID length", () => {
		expect(() => decodePacked("zzzz")).toThrow();
		expect(() => decodePacked("z".repeat(MULSID_LENGTH + 1))).toThrow();
	});

	test("should fail with invalid characters", () => {
		expect(() => decodePacked("z0-0z0z0z0")).toThrow();
	});
});

describe("constants", () => {
	test("RANDOMNESS_BITS should be 18", () => {
		expect(RANDOMNESS_BITS).toEqual(18);
	});
});
