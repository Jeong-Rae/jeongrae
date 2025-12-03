"use client";

import { useState } from "react";

const tabs = ["전체", "개발", "데이터/ML", "디자인", "프로덕트"];

export function ArticleTabs() {
	const [activeTab, setActiveTab] = useState("전체");

	return (
		<div className="border-b border-border">
			<div className="flex gap-8">
				{tabs.map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`relative py-4 text-sm font-medium transition-colors ${
							activeTab === tab
								? "text-foreground"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						{tab}
						{activeTab === tab && (
							<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
						)}
					</button>
				))}
			</div>
		</div>
	);
}
