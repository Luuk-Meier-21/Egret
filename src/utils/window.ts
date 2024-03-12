import { useEffect } from "react";

/**
 * (ab)uses html head title to make screenreaders announce a message when landing on a new page.
 * @param message message to announce
 * @param condition not implmented yet
 */
export function useAnnounce(message: string, condition: boolean = true) {
  useEffect(() => {
    document.title = message;

    // return () => {
    //   document.title = "-";
    // };
  }, []);
}
