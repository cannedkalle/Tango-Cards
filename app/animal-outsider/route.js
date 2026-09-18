import { readFile } from "node:fs/promises";
import path from "node:path";

const htmlPath = path.join(process.cwd(), "public", "apps", "animal-outsider", "index.html");

export async function GET() {
  const html = await readFile(htmlPath, "utf8");

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
