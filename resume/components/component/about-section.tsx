import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import styles from "./about-section.module.scss";

const strengths = ["Design Systems", "Product Strategy", "React", "TypeScript", "Figma", "Accessibility"];

export function AboutSection() {
  return (
    <Card className={styles.about}>
      <h2 className={styles.about__title}>1. About</h2>
      <div className={styles.about__content}>
        <div>
          <p className={styles.about__description}>I’m a product designer and frontend engineer who loves building beautiful, useful, and accessible digital experiences.</p>
          <ul className={styles.about__list}>
            <li>Product thinking & user empathy</li><li>Design systems & UI craftsmanship</li><li>Frontend engineering & prototyping</li><li>Data-informed & outcome focused</li>
          </ul>
        </div>
        <div className={styles.about__stats}>
          {[ ["6+", "Years Experience"], ["24+", "Projects Shipped"], ["6", "Awards Received"] ].map(([v, l]) => (
            <Card key={l} className={styles.about__statCard}><p className={styles.about__value}>{v}</p><p className={styles.about__label}>{l}</p></Card>
          ))}
        </div>
      </div>
      <div className={styles.about__footer}>
        <p>Key Strengths</p>
        <div className={styles.about__strengths}>{strengths.map((item) => <Badge key={item}>{item}</Badge>)}</div>
      </div>
    </Card>
  );
}
