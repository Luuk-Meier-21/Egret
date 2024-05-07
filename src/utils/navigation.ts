import { NavigateFunction } from "react-router";

export function navigateDropState(navigate: NavigateFunction, url: string) {
  navigate("/");
  setTimeout(() => {
    navigate(url);
  }, 50);
}
