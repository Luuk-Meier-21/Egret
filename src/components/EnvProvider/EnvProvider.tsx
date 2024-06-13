import { getMatches } from "@tauri-apps/api/cli";
import { ReactNode, createContext, useState } from "react";

interface EnvProviderProps {
  children: ReactNode | ReactNode[];
}

export const EnvContext = createContext<Record<string, any>>({});

function EnvProvider({ children }: EnvProviderProps) {
  const [env, setEnv] = useState<Record<string, any>>();

  getMatches().then((cliMatches) => {
    // setTimeout(() => {
    setEnv({ features: cliMatches.args.feature });
    // }, 3000);
  });

  if (env === undefined) {
    return null;
  }

  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
}

export default EnvProvider;
