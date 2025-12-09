import { ButtonLink } from "../ui/button-link";
import { Image } from "../ui/image";

export function GithubButton() {
  return (
    <ButtonLink
      href="https://github.com/Jeong-Rae"
      size="sm"
      rel="noopener noreferrer"
      className="flex items-center gap-2 bg-[#24292e] hover:bg-[#1f2428] text-white"
    >
      <Image src="/github-mark-white.svg" alt="GitHub" width={16} height={16} />
      <Image src="/github-logo-white.png" alt="GitHub" width={48} height={16} />
    </ButtonLink>
  );
}
