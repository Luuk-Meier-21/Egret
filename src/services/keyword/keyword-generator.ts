import { Keyword } from "../../types/keywords";
import { v4 as uuidv4 } from "uuid";
import { slugify } from "../../utils/url";

export function generateKeyword(data: Partial<Keyword> & { label: string }) {
  return {
    id: data.id || uuidv4(),
    label: data.label,
    slug: data.slug || slugify(data.label),
    documentRelations: data.documentRelations || [],
  };
}
