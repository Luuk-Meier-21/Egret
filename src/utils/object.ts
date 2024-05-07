export class ObjectRegistry<T extends Record<string, {}>> {
  protected constructor(private registry: T) {}

  register<K extends string, S>(
    key: K,
    object: S,
  ): ObjectRegistry<Record<K, S> & T> {
    // add service to registry and return the same object with a narrowed type
    (this.registry as any)[key] = object;
    return this as unknown as ObjectRegistry<Record<K, S> & T>;
  }

  remove<K extends keyof T & string>(key: K) {
    delete (this.registry as any)[key];
  }

  get<K extends keyof T & string>(key: K): T[K] {
    if (!(key in this.registry)) {
      throw new Error(`Invalid type (${key}) `);
    }
    return this.registry[key];
  }

  keys<K extends keyof T & string>(): K[] {
    return Object.keys(this.registry) as K[];
  }

  static init(): ObjectRegistry<{}> {
    return new ObjectRegistry({});
  }
}

export function deepJSONClone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export function objectIsEqual<
  T extends Record<string, any> | Record<string, any>[],
>(objectA: T, objectB: T): Boolean {
  return JSON.stringify(objectA) === JSON.stringify(objectB);
}
