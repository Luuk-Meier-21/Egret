export class Enum {
  static values(enumObject: Record<string | number, any>) {
    const keys = Enum.keys(enumObject);
    return Object.values(enumObject).filter((item) => {
      return !keys.includes(item);
    });
  }

  static keys(enumObject: Record<string, any>) {
    return Object.keys(enumObject).filter((el) => {
      return isNaN(Number(el));
    });
  }

  static entries(enumObject: Record<string, any>): [string, number][] {
    const keys = Enum.keys(enumObject);
    return Object.entries(enumObject)
      .map(([key, value]) => {
        if (keys.includes(key)) {
          return [key, value];
        }

        return undefined;
      })
      .filter((value) => value !== undefined);
  }
}
