import { describe, expect, test } from "bun:test";
import {
	BASE,
	encodeRandomness,
	encodeTime,
	fromBase62,
	getTimestamp,
	MAX_TIMESTAMP_VALUE,
	RANDOM_LENGTH,
	TIMESTAMP_LENGTH,
	toBase62,
} from "../util";

describe("getTimestamp()", () => {
	test("should return an integer", () => {
		expect(getTimestamp()).toBeInteger();
		expect(getTimestamp(1.1)).toBeInteger();
	});
});

describe("toBase62()", () => {
	test("should encode to base62", () => {
		expect(toBase62(BigInt(0), 3)).toEqual("000");
		expect(toBase62(BigInt(BASE ** 3 - 1), 3)).toEqual("zzz");
	});

	test("should fail when width to small for given number", () => {
		const width = 4;
		const tooBig = BigInt(BASE ** width);
		expect(() => toBase62(tooBig, width)).toThrow();
	});
});

describe("fromBase62()", () => {
	test("should decode from base62", () => {
		expect(fromBase62("000")).toEqual(BigInt(0));
		expect(fromBase62("zzz")).toEqual(BigInt(BASE ** 3 - 1));
	});

	test("should fail when encountering invalid base62 character", () => {
		expect(() => fromBase62("!00")).toThrow();
	});
});

describe("encodeTime()", () => {
	test("should have correct length", () => {
		expect(encodeTime(getTimestamp()).length).toEqual(TIMESTAMP_LENGTH);
	});

	test("should encode time", () => {
		expect(encodeTime(getTimestamp(0))).toEqual("0000000");
		expect(encodeTime(MAX_TIMESTAMP_VALUE)).toEqual("zzzzzzz");
	});

	test("should fail if not integer", () => {
		expect(() => encodeTime(1.1)).toThrow();
	});

	test("should fail if less than zero", () => {
		expect(() => encodeTime(-1)).toThrow();
	});

	test("should fail if greater than max allowed value", () => {
		expect(() => encodeTime(MAX_TIMESTAMP_VALUE + 1)).toThrow();
	});
});

describe("encodeRandomness()", () => {
	test("should have correct length", () => {
		expect(encodeRandomness().length).toEqual(RANDOM_LENGTH);
	});
});
