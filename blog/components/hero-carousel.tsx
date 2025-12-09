"use client";

import { useState } from "react";
import { useCircleIndexNavigator } from "@/hook/useIndexNavigator";
import { useScheduleEffect } from "@/hook/useScheduleEffect";
import { Repeat } from "@/lib/react/repeat";
import { Image } from "./ui/image";

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

  const [isHover, setIsHover] = useState(false);

  useScheduleEffect({
    every: "5s",
    do: () => {
      goNext();
    },
    until: () => isHover,
  });

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-[var(--color-hero)] h-[300px]"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className="relative h-full">
        <Repeat.Each each={carouselItems}>
          {(item, index) => {
            const isActive = index === currentIndex;

            return (
              <div
                key={item.id}
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
          }}
        </Repeat.Each>
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <Repeat.Times times={carouselItems.length}>
          {(index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-hero-foreground"
                  : "bg-hero-foreground/50"
              }`}
              onClick={() => setIndex(index)}
            />
          )}
        </Repeat.Times>
      </div>
    </div>
  );
}
