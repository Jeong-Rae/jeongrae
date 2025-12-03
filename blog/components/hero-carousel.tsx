"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCircleIndexNavigator } from "@/hook/useIndexNavigator";

const carouselItems = [
	{
		id: 1,
		title: "TechBlog",
		thumbnail: "/tech-blog-hero-banner-with-floating-3d-icons.jpg",
	},
	{
		id: 2,
		title: "혁신적인 기술 이야기",
		thumbnail: "/innovative-technology-banner-with-gradients.jpg",
	},
	{
		id: 3,
		title: "개발자의 성장",
		thumbnail: "/developer-growth-journey-banner.jpg",
	},
];

export function HeroCarousel() {
	const {
		index: currentIndex,
		goNext,
		goPrev,
		setIndex,
	} = useCircleIndexNavigator({
		length: carouselItems.length,
		initialIndex: 0,
	});

	useEffect(() => {
		const timer = setInterval(() => {
			goNext();
		}, 5000);
		return () => clearInterval(timer);
	}, [goNext]);

	return (
		<div className="relative w-full overflow-hidden rounded-2xl bg-[var(--color-hero)] h-[300px]">
			<div className="relative h-full">
				{carouselItems.map((item, index) => (
					<div
						key={item.id}
						className={`absolute inset-0 transition-opacity duration-500 ${
							index === currentIndex ? "opacity-100" : "opacity-0"
						}`}
					>
						<div className="relative h-full w-full flex items-center justify-center">
							<img
								src={item.thumbnail || "/placeholder.svg"}
								alt={item.title}
								className="absolute inset-0 h-full w-full object-cover"
							/>
							<h2 className="relative z-10 font-bold text-hero-foreground text-4xl drop-shadow-lg">
								{item.title}
							</h2>
						</div>
					</div>
				))}
			</div>

			<Button
				variant="ghost"
				size="icon"
				className="absolute top-1/2 left-4 -translate-y-1/2 bg-background/80 hover:bg-background"
				onClick={goPrev}
			>
				<ChevronLeft className="h-5 w-5" />
				<span className="sr-only">이전</span>
			</Button>

			<Button
				variant="ghost"
				size="icon"
				className="absolute top-1/2 right-4 -translate-y-1/2 bg-background/80 hover:bg-background"
				onClick={goNext}
			>
				<ChevronRight className="h-5 w-5" />
				<span className="sr-only">다음</span>
			</Button>

			<div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
				{carouselItems.map((_, index) => (
					<button
						key={index}
						className={`h-2 w-2 rounded-full transition-all ${
							index === currentIndex
								? "w-8 bg-hero-foreground"
								: "bg-hero-foreground/50"
						}`}
						onClick={() => setIndex(index)}
					/>
				))}
			</div>
		</div>
	);
}
