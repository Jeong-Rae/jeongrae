import { Image } from "../ui/image";

export function Logo() {
  return (
    <>
      <Image src={"/logo.svg"} alt="logo" width={36} height={36} />
      <span className="font-bold text-xl">Jeongrae</span>
    </>
  );
}
