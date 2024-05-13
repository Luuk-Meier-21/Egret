export function keyNavigation(...keys: string[]) {
  return ["option", ...keys].join("+");
}

export function keyExplicitNavigation(...keys: string[]) {
  return ["option", "shift", ...keys].join("+");
}

export function keyAction(...keys: string[]) {
  return ["cmd", ...keys].join("+");
}

export function keyExplicitAction(...keys: string[]) {
  return ["cmd", "shift", ...keys].join("+");
}

export function keyLandmark(...keys: string[]) {
  return ["cmd", "option", ...keys].join("+");
}
