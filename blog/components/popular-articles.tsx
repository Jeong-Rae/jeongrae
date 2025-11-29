const popularArticles = [
  {
    id: 1,
    title: "API 인증 자동화를 위한 여정: 토스는 왜 서비 MCP 서비를 개발했어는가? with Spring-AI",
    author: "조민규",
  },
  {
    id: 2,
    title: "기행잡은 편집인이, 결제앱 시스템 전면 재건성하기",
    author: "황성우",
  },
  {
    id: 3,
    title: "20년 레거시를 담아 버릴운을 준비하는 시스템 만들기",
    author: "하태호",
  },
]

export function PopularArticles() {
  return (
    <div>
      <h3 className="font-bold text-lg mb-4 text-[#191f28]">인기있는 글</h3>
      <div className="space-y-4">
        {popularArticles.map((article) => (
          <a
            key={article.id}
            href={`/article/${article.id}`}
            className="block group hover:opacity-80 transition-opacity"
          >
            <h4 className="font-medium text-sm leading-snug mb-1 text-balance text-[#4e5968] group-hover:text-[#3182f6] transition-colors">
              {article.title}
            </h4>
            <p className="text-[#6b7684] text-xs">{article.author}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
