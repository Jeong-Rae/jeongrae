import { NextResponse } from "next/server";
import {
  findArticleMetasByQuery,
  getRecommendedArticles,
} from "@/lib/mdx/articles";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";

  const articles = query
    ? findArticleMetasByQuery(query)
    : getRecommendedArticles(3);

  return NextResponse.json({ articles });
}
