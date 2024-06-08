import { documentToSVG, inlineResources } from "dom-to-svg";

export const exportToSvg = async () => {
  const svgDocument = documentToSVG(document);

  await inlineResources(svgDocument.documentElement);

  const svgString = new XMLSerializer().serializeToString(svgDocument);
  return svgString;
};
