"use client";

import { useCircleIndexNavigator } from "@/hook/useIndexNavigator";
import { useScheduleEffect } from "@/hook/useScheduleEffect";
import { useBooleanState } from "@/hook/useBooleanState";
import { Repeat } from "@/lib/react/repeat";
import { Image } from "@jeongrae/ui";

import Mesh474 from "@/public/mesh-474.png";
import Mesh910 from "@/public/mesh-910.png";

const carouselItems = [
  {
    id: 1,
    title: "Do one thing well.",
    background: Mesh474,
  },
  {
    id: 2,
    title: "There are no solutions. \nThere are only trade-offs",
    background: Mesh474,
  },
  {
    id: 3,
    title: "There is no success\nwithout failure.",
    background: Mesh910,
  },
];

export function HeroCarousel() {
  const {
    index: currentIndex,
    goNext,
    setIndex,
  } = useCircleIndexNavigator({
    length: carouselItems.length,
    initialIndex: 0,
  });

  const {
    value: isHover,
    setTrue: handleMouseEnter,
    setFalse: handleMouseLeave,
  } = useBooleanState(false);

  useScheduleEffect({
    every: "5s",
    do: goNext,
    until: () => isHover,
  });

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-[var(--color-hero)] h-[300px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative h-full">
        <Repeat.Each each={carouselItems}>
          {(item, index) => (
            <CarouselItem
              key={item.id}
              item={item}
              isActive={index === currentIndex}
            />
          )}
        </Repeat.Each>
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <Repeat.Times times={carouselItems.length}>
          {(index) => (
            <CarouselIndicator
              key={index}
              isActive={index === currentIndex}
              onClick={() => setIndex(index)}
            />
          )}
        </Repeat.Times>
      </div>
    </div>
  );
}

function CarouselIndicator({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`h-2 w-2 rounded-full transition-all ${
        isActive ? "w-8 bg-hero-foreground" : "bg-hero-foreground/50"
      }`}
      onClick={onClick}
    />
  );
}

function CarouselItem({
  item,
  isActive,
}: {
  item: (typeof carouselItems)[number];
  isActive: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 transition-all duration-[900ms] ease-in-out ${
        isActive ? "opacity-100 scale-100" : "opacity-0 scale-105"
      }`}
    >
      <div className="relative h-full w-full flex items-center justify-center">
        <Image
          src={item.background}
          alt={item.title}
          fill
          className="absolute inset-0 h-full w-full object-cover"
        />
        <h2 className="relative z-10 font-bold text-hero-foreground text-4xl drop-shadow-lg whitespace-pre-line">
          {item.title}
        </h2>
      </div>
    </div>
  );
}
