import { BlogHeader } from "@/components/blog-header"
import { ArticleContent } from "@/components/article-content"
import { RelatedSeries } from "@/components/related-series"

// Sample article data
const articleData = {
  "1": {
    id: 1,
    title: "토스에서 가장 안 좋은 경험 만들기",
    author: "이현정",
    date: "2025년 11월 7일",
    content: `토스에서 해택 서비스를 맡고 있는 이현정입니다. 해택 서비스는 포인트를 주는 서비스나 광고들이 모여 있는 탭이에요. 저는 그곳에 있는 광고와 서비스들을 오롯동안 담당해왔고, 지금은 그로스 도메인에서 토스 유저를 늘리는 일에 집중하고 있어요. 이 글에서는 비즈니스와 사용자 경험, 두 가지를 모두 챙기는 교집합을 찾아가는 과정에 대해 들려드릴게요.

외부 디자이너를 만나 먼저 할성 든는 말이 있어요.

> "토스 디자이너들은 광고 삽이하죠?"
> "비즈니스나 사용자나, 결국 뭘 선택하나요?"
> "사용자 경험을 위해 팀이랑 싸우지 않나요?"

실제 토스는 그렇게 단순하진 않아요. 광고를 제공하는 것에 얼핏하고, 비즈니스의 사용자 경험, 둘 다 챙기자 하죠. 그리고 위해 팀과 싸우는게 아니라 같이 치열하게 고민해요.

결국 중요한 건 비즈니스와 사용자 경험, 둘 사이의 교집합을 찾아내는 일이더라고요.`,
    relatedSeries: [
      {
        id: 2,
        title: "토스페이먼츠 삽입으로 QA로 일한다는 것",
        description: "오늘가 들어나는 문제들에 대해서",
        date: "2025년 11월 4일",
        author: "채소현",
        image: "/qa-testing-illustration.jpg",
      },
      {
        id: 3,
        title: "토스 피플 : 데이터팀 '이해하는' 구조를 설계합니다",
        description:
          "데이터의 의미를 구조화로 만들려면, 설계 여러을 강의로, 토스의 1호 Data Architect 고영한의 커리어 이야기를 들려드립니다.",
        date: "2025년 10월 31일",
        author: "고영한",
        image: "/data-architecture-diagram.jpg",
      },
    ],
  },
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  const article = articleData[params.id as keyof typeof articleData]

  if (!article) {
    return <div>Article not found</div>
  }

  return (
    <div className="min-h-screen">
      <BlogHeader />

      <main className="container mx-auto max-w-3xl px-4 py-12">
        {/* Article Header */}
        <article>
          <header className="mb-12 text-center">
            <h1 className="text-[42px] font-bold leading-[1.4] text-[#191f28] mb-6">{article.title}</h1>
            <div className="flex items-center justify-center gap-2 text-[#4e5968]">
              <span className="text-base">{article.author}</span>
              <span>·</span>
              <span className="text-base">{article.date}</span>
            </div>
          </header>

          {/* Article Content */}
          <ArticleContent content={article.content} />
        </article>

        {/* Related Series */}
        {article.relatedSeries && article.relatedSeries.length > 0 && (
          <div className="mt-20 pt-12 border-t border-border">
            <RelatedSeries articles={article.relatedSeries} />
          </div>
        )}
      </main>
    </div>
  )
}
