import { DependencyList, EffectCallback, useEffect, useRef } from "react";
import { objectIsEqual } from "../../utils/object";

export function useStrictEffect<
  DT extends DependencyList,
  RT extends number | boolean | string,
>(effect: EffectCallback, normalize: (deps: [...DT]) => RT, deps: [...DT]) {
  const prefRef = useRef<RT>(normalize(deps));

  useEffect(() => {
    const current = normalize(deps);
    let destructor: any = () => {};

    if (current !== prefRef.current) {
      destructor = effect();
    }

    prefRef.current = current;
    return destructor;
  }, deps);
}

export function useObservableEffect(
  effect: EffectCallback,
  deps?: DependencyList | undefined,
) {
  const ref = useRef(deps);

  useEffect(() => {
    let destructor: any = () => {};

    if (!objectIsEqual(ref.current as any, deps)) {
      destructor = effect();
    }

    ref.current = deps;
    return destructor;
  }, deps);
}
