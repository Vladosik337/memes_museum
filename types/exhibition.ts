export type ExhibitionStatus = "draft" | "published" | "archived";

export interface Exhibition {
  id: number;
  slug: string;
  title: string;
  emoji: string; // замість картинок
  short_description: string;
  content_md: string;
  start_date?: string | null;
  end_date?: string | null;
  status: ExhibitionStatus;
  banner_color?: string; // додано: колір банера (green, yellow, blue, red, violet)
  created_at: string;
  updated_at: string;
}

export interface ExhibitionInputBase {
  title: string;
  emoji: string;
  short_description: string;
  content_md: string;
  start_date?: string | null;
  end_date?: string | null;
}

export interface ExhibitionCreateInput extends ExhibitionInputBase {
  status?: ExhibitionStatus; // по замовчуванню "draft"
}

export interface ExhibitionUpdateInput extends Partial<ExhibitionInputBase> {
  status?: ExhibitionStatus;
}
