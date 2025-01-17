import reduce from "../reduce";
import type IterableInfer from "../types/IterableInfer";
import type { AsyncReducer, SyncReducer } from "../types/Reducer";
import type ReturnValueType from "../types/ReturnValueType";

type InferCarrier<T> = T extends AsyncIterable<infer R>
  ? AsyncIterable<R>
  : T extends Iterable<unknown>
  ? T
  : never;

// DO NOT change the order of signatures prematurely.
// See `reduceLazy.test.ts` for the reason

/**
 * High order functional version of `reduce`, which behaves identical to it.
 *
 * @param f Reducer function `(acc, value) => acc`. It can be both synchronous and asynchronous.
 * @param seed Initial value. Note that if the type of `acc` and `value` differ, `seed` must be given.
 *
 * @example
 * Type must be provided for stand alone call.
 *
 * ```ts
 * const reduce = reduceLazy((a: number, b: number) => a + b, 5)
 *
 * reduce([1, 2, 3]) // number
 * reduce(toAsync([1, 2, 3])) // Promise<number>
 * ```
 *
 * Fit perfectly with `pipe`
 *
 * ```ts
 * pipe(
 *   [1, 2, 3, 4],
 *   reduceLazy((a, b) => a + b, 5)
 * ); // 15
 * ```
 *
 * You can use asynchronous callback
 *
 * ```ts
 * await pipe(
 *   [1, 2, 3, 4],
 *   reduceLazy(async (a, b) => a + b, 5)
 * ); // 15
 * ```
 *
 * `AsyncIterable` doesn't matter.
 *
 * ```ts
 * await pipe(
 *   [1, 2, 3, 4],
 *   toAsync,
 *   reduceLazy((a, b) => a + b, 5)
 * ); // 15
 * ```
 */
function reduceLazy<T extends Iterable<unknown> | AsyncIterable<unknown>, Acc>(
  f: SyncReducer<Acc, IterableInfer<T>> | AsyncReducer<Acc, IterableInfer<T>>,
  seed: Acc,
): (iterable: InferCarrier<T>) => ReturnValueType<T, Acc>;

function reduceLazy<T extends Iterable<unknown> | AsyncIterable<unknown>>(
  f:
    | AsyncReducer<IterableInfer<T>, IterableInfer<T>>
    | SyncReducer<IterableInfer<T>, IterableInfer<T>>,
  seed?: IterableInfer<T>,
): (iterable: InferCarrier<T>) => ReturnValueType<T, IterableInfer<T>>;

function reduceLazy<T, Acc>(
  f: SyncReducer<Acc, T>,
  seed: Acc,
): <C extends Iterable<T> | AsyncIterable<T>>(
  iterable: C,
) => ReturnValueType<C, Acc>;

function reduceLazy<T>(
  f: SyncReducer<T, T>,
  seed?: T,
): <C extends Iterable<T> | AsyncIterable<T>>(
  iterable: C,
) => ReturnValueType<C>;

function reduceLazy<T, Acc>(
  f: AsyncReducer<Acc, T>,
  seed: Acc,
): (iterable: Iterable<T> | AsyncIterable<T>) => Promise<Acc>;

function reduceLazy<T>(
  f: AsyncReducer<T, T>,
  seed?: T,
): (iterable: Iterable<T> | AsyncIterable<T>) => Promise<T>;

function reduceLazy<T extends Iterable<unknown> | AsyncIterable<unknown>, Acc>(
  f: SyncReducer<Acc, IterableInfer<T>>,
  seed?: Acc,
) {
  if (seed === undefined) {
    return (iterable: Iterable<unknown> | AsyncIterable<unknown>) =>
      reduce(f, iterable as any);
  }
  return (iterable: Iterable<unknown> | AsyncIterable<unknown>) =>
    reduce(f, seed, iterable as any);
}

export default reduceLazy;
