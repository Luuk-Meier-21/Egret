import { Howl } from "howler";

export async function handleSucces() {
  const sound = new Howl({
    src: ["audio/succes.mp3"],
  });
  sound.play();
}

export async function handleError(...messages: any[]) {
  console.error(messages.join(""));
  const sound = new Howl({
    src: ["audio/error.mp3"],
  });
  sound.play();
}
