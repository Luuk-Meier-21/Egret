import { DependencyList, EffectCallback, useEffect, useRef } from "react";
import { objectIsEqual } from "../../utils/object";

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
