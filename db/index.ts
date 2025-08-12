import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  exhibitions,
  meme_alt_titles,
  meme_categories,
  meme_details,
  meme_formats,
  meme_media,
  meme_moderation,
  meme_tags,
  memes,
  users,
} from "./schema";

const db = drizzle(process.env.DATABASE_URL!);

export {
  db,
  exhibitions,
  meme_alt_titles,
  meme_categories,
  meme_details,
  meme_formats,
  meme_media,
  meme_moderation,
  meme_tags,
  memes,
  users,
};
