import { MacOSSystemSound, voiceSay } from "../bindings";
import { SoundOptions, playSound } from "./sound";

export async function handleSucces() {
  // succesSound();
}

export async function handleError(...messages: any[]) {
  console.error(messages.join(""));
  // failedSound();
}

export type AnnounceType = {
  type: string;
  message: string;
  sound: MacOSSystemSound;
  soundOptions: Partial<SoundOptions>;
};

export type AnnounceMoveEffect = AnnounceType;
export type AnnounceEffect = AnnounceMoveEffect;

export function announce(effect: AnnounceEffect, verbose?: boolean) {
  if (verbose) {
    voiceSay(effect.message);
  } else {
    playSound(effect.sound, effect.soundOptions);
  }
}

export const announceConfig: Record<string, AnnounceType> = {
  up: {
    type: "up",
    message: "Moving up",
    sound: "Purr",
    soundOptions: { speed: 2.5, volume: 1, time: 0.5 },
  },
  down: {
    type: "down",
    message: "Moving down",
    sound: "Purr",
    soundOptions: { speed: 2.5, volume: 1, time: 0.5 },
  },
  left: {
    type: "left",
    message: "Moving left",
    sound: "Purr",
    soundOptions: { speed: 2.5, volume: 1, time: 0.5 },
  },
  right: {
    type: "right",
    message: "Moving right",
    sound: "Purr",
    soundOptions: { speed: 2.5, volume: 1, time: 0.5 },
  },
  rowChildren: {
    type: "right",
    message: "Moving right",
    sound: "Purr",
    soundOptions: { speed: 2.5, volume: 1, time: 0.5 },
  },
};
