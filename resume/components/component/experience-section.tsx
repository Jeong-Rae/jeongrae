import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import styles from "./experience-section.module.scss";

type ExperienceItem = {
  period: string;
  duration: string;
  company: string;
  role: string;
  stacks: string[];
  bullets: string[];
};

const experiences: ExperienceItem[] = [
  {
    period: "2022. 01 - 현재",
    duration: "(2년 5개월)",
    company: "Vercel Korea",
    role: "Frontend Engineer",
    stacks: ["Next.js", "TypeScript", "React", "Tailwind CSS"],
    bullets: [
      "Vercel 블로그 및 마케팅 페이지 프론트엔드 개발 및 성능 최적화",
      "디자인 시스템 고도화 및 컴포넌트 라이브러리 구축",
      "A/B 테스트 및 분석을 통한 사용자 경험 개선",
      "신규 기능 개발 및 코드 리뷰를 통한 팀 생산성 향상",
    ],
  },
  {
    period: "2020. 07 - 2021. 12",
    duration: "(1년 6개월)",
    company: "토스페이먼츠",
    role: "Frontend Developer",
    stacks: ["React", "TypeScript", "Styled Components", "Recoil"],
    bullets: [
      "결제 대시보드 및 운영 툴 프론트엔드 개발",
      "컴포넌트 재사용성 개선 및 유지보수성 향상",
      "비즈니스 요구사항을 반영한 인터페이스 구현",
      "사용자 피드백 기반 UI/UX 개선 및 버그 수정",
    ],
  },
  {
    period: "2018. 03 - 2020. 06",
    duration: "(2년 4개월)",
    company: "브랜디",
    role: "Frontend Developer",
    stacks: ["JavaScript", "React", "Redux", "Sass"],
    bullets: [
      "이커머스 플랫폼 프론트엔드 개발 및 유지보수",
      "상품 등록, 검색, 상세 페이지 등 주요 화면 구현",
      "성능 개선 및 접근성 향상을 위한 리팩토링 수행",
      "백엔드 및 디자이너와 협업하여 기능 출시",
    ],
  },
];

export function ExperienceSection() {
  return (
    <section className={styles.experience}>
      <Badge variant="primary" pill>
        EXPERIENCE
      </Badge>

      <h2 className={styles.experience__title}>경력</h2>
      <p className={styles.experience__description}>
        다양한 환경에서 문제를 정의하고, 사용자 중심의 해결책을 만들어 가며 성장했습니다.
      </p>

      <div className={styles.experience__list}>
        {experiences.map((item) => (
          <div key={`${item.company}-${item.period}`} className={styles.experience__item}>
            <div className={styles.experience__period}>
              <div className={styles.experience__dot} />
              <p className={styles.experience__date}>{item.period}</p>
              <p className={styles.experience__duration}>{item.duration}</p>
            </div>

            <Card className={styles.experience__card}>
              <div className={styles.experience__header}>
                <div>
                  <p className={styles.experience__company}>{item.company}</p>
                  <p className={styles.experience__role}>{item.role}</p>
                </div>

                <div className={styles.experience__skills}>
                  {item.stacks.map((stack) => (
                    <Badge key={stack}>{stack}</Badge>
                  ))}
                </div>
              </div>

              <ul className={styles.experience__bullets}>
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
