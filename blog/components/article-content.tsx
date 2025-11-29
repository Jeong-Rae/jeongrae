export function ArticleContent({ content }: { content: string }) {
  // Split content by line breaks to render paragraphs and blockquotes
  const blocks = content.split("\n\n")

  return (
    <div className="prose prose-lg max-w-none">
      {blocks.map((block, index) => {
        // Check if block is a blockquote (starts with >)
        if (block.trim().startsWith(">")) {
          const quotes = block
            .split("\n")
            .filter((line) => line.trim().startsWith(">"))
            .map((line) => line.replace(/^>\s*/, "").trim())

          return (
            <blockquote key={index} className="border-l-4 border-[#3182f6] pl-6 py-2 my-8 bg-transparent">
              {quotes.map((quote, qIndex) => (
                <p key={qIndex} className="text-[17px] leading-[1.8] text-[#4e5968] my-2">
                  {quote}
                </p>
              ))}
            </blockquote>
          )
        }

        // Regular paragraph
        if (block.trim()) {
          return (
            <p key={index} className="text-[17px] leading-[1.8] text-[#4e5968] mb-6">
              {block}
            </p>
          )
        }

        return null
      })}
    </div>
  )
}
