import { ReactNode } from "react";

interface AriaRegionProps {
  title: string;
  children: ReactNode;
}

function AriaRegion({ children }: AriaRegionProps) {
  return children;
}
export default AriaRegion;
