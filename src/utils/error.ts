import { systemSound } from "../bindings";

export const announceError = () => {
  systemSound("Basso", 3, 1.5, 0.2);
};
