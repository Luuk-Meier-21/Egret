export function clientEndpoint(serverIp: string, port: number = 1420) {
  return `http://${serverIp}:${port}/window/companion/index.html`;
}

export function socketEndpoint(serverIp: string) {
  return `ws://${serverIp}:2000/socket`;
}
