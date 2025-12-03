const popularArticles = [
  {
    id: 1,
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
  },
];

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
  );
}
