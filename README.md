# MULSID
Mini Unique Lexicoographically Sortable ID. A short (10 character) ID for improved database efficiency in inserts and storage. MULSID is not suitable certain use-cases, as it makes a compromise on randomness to favor shorter ID length.

## About

You can read more about MULSID, how it works, and what it is useful for in INSERT BLOG LINK HERE

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

const id = mulsid() // 3Ra1dnMrqS
```

You can also guarantee a monotonically increasing ID by using the `monotonicMULSID` function

```ts
import { monotonicMULSID } from "@mpact/mulsid";

const id1 = monotonicMULSID(); // 3Ra1iMP4L5
const id2 = monotonicMULSID(); // 3Ra1iMP4L6
```

You can also determine the time the MULSID was generated within 9 milliseconds using the `decodeTime` function

```ts
import { ulid, decodeTime } from "@mpact/mulsid";

const id = ulid(0); // 0000000SeM
const time = decodeTime(id); // 0

const id2 = ulid(4); // 0000000rrc
const time2 = decodeTime(id2); // 0

const id3 = ulid(10); // 0000001uLE
const time3 = decodeTime(id3) // 9
```

## Learn More

MULSID is not suitable for every use-case. To learn more about how MULSID works, the design choices made when developing it, and its pros and cons, you can read [this blog post](https://mpact.llc/blog/mini-unique-lexicographically-sortable-id).

## MULSID in Action

Check out [the demo](https://mulsid.mpact.llc) to see MULSID in action
