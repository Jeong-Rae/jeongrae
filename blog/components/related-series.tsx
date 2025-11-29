type Article = {
  id: number
  title: string
  description: string
  date: string
  author: string
  image: string
}

export function RelatedSeries({ articles }: { articles: Article[] }) {
  return (
    <section>
      <h2 className="text-[24px] font-bold text-[#191f28] mb-8">같이 보면 좋은 시리즈</h2>

      <div className="space-y-6">
        {articles.map((article) => (
          <a
            key={article.id}
            href={`/article/${article.id}`}
            className="group flex gap-6 py-6 border-b border-border last:border-0 hover:opacity-80 transition-opacity"
          >
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div className="space-y-2">
                <h3 className="font-bold text-[20px] leading-[1.6] text-[#4e5968] group-hover:text-[#3182f6] transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm leading-[1.6] text-[#4e5968]">{article.description}</p>
              </div>
              <div className="text-xs leading-[1.6] text-[#4e5968] mt-3">
                {article.date} · {article.author}
              </div>
            </div>
            <div className="flex-shrink-0 w-[130px] h-[90px] rounded-lg overflow-hidden">
              <img
                src={article.image || "/placeholder.svg?height=90&width=130"}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
