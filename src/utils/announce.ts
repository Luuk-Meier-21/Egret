export async function handleSucces() {
  // succesSound();
}

export async function handleError(...messages: any[]) {
  console.error(messages.join(""));
  // failedSound();
}
