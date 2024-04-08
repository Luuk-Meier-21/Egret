export interface LayoutNavigatable<NT> {
  getValue: () => NT;
  getFirst: () => NT;
  left: () => NT;
  right: () => NT;
  up: () => NT;
  down: () => NT;
}

export class LayoutNavigator<T> {
  constructor(public navigator: LayoutNavigatable<T>) {}

  getValue = (): T => {
    return this.navigator.getValue();
  };

  getFirst = () => this.navigator.getFirst();

  update = (navigator: LayoutNavigatable<T>): LayoutNavigator<T> => {
    this.navigator = navigator;
    return this;
  };

  left = (): T => {
    return this.navigator.left();
  };

  right = (): T => {
    return this.navigator.right();
  };

  up = (): T => {
    return this.navigator.up();
  };

  down = (): T => {
    return this.navigator.down();
  };
}
