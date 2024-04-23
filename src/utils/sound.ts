import { MacOSSystemSound, systemSound } from "../bindings";

export interface SoundOptions {
  speed: number;
  volume: number;
  time: number;
}

export function playSound(
  sound: MacOSSystemSound,
  options?: Partial<SoundOptions>,
) {
  systemSound(
    sound,
    options?.speed || 1,
    options?.volume || 1,
    options?.time || 1,
  );
}

export async function delay(milisec: number) {
  return new Promise((res) => {
    setTimeout(res, milisec);
  });
}
