# MULSID
Mini Unique Lexicographically Sortable ID. A short (10 character) ID for improved database efficiency in inserts and storage. MULSID is not suitable for certain use-cases, as it makes a compromise on randomness to favor shorter ID length.

## About

MULSID uses a **BP-18-9** bit-packed layout internally. The 10-character base62 string encodes a single integer containing:

- **Timestamp tick** (upper bits) — derived from the current time using 9 ms increments
- **18-bit randomness** (lower bits) — 262,144 random states per tick

This gives approximately **913 years** of unique ID coverage from the Unix epoch.

You can read more about MULSID in [this blog post](https://mpact.llc/blog/mini-unique-lexicographically-sortable-id). Check out [the demo](https://mulsid.mpact.llc) to see MULSID in action.

## Install

### NPM
```sh
npm install @mpact/mulsid
```

### Bun
```sh
bun add @mpact/mulsid
```

### Deno
```sh
deno add jsr:@mpact/mulsid
```

## Usage

To generate a random MULSID, you can import and use the `mulsid` function

```ts
import { mulsid } from "@mpact/mulsid";

const id = mulsid() // 0uXqlC3DGY
```

You can also guarantee a monotonically increasing ID by using the `monotonicMULSID` function

```ts
import { monotonicMULSID } from "@mpact/mulsid";

const id1 = monotonicMULSID();
const id2 = monotonicMULSID(); // Always lexicographically greater than id1
```

You can also determine the time the MULSID was generated within 9 milliseconds using the `decodeTimestamp` function

```ts
import { mulsid, decodeTimestamp } from "@mpact/mulsid";

const id = mulsid(0);
const time = decodeTimestamp(id); // 0 (the tick rounded down to the nearest 9 ms boundary)

const id2 = mulsid(10);
const time2 = decodeTimestamp(id2); // 9
```
