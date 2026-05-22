import Image from "next/image";
import { Mail, Globe, MapPin, Linkedin, Github } from "lucide-react";
import { AboutSection } from "@/components/component/about-section";
import { ExperienceSection } from "@/components/component/experience-section";
import { Card } from "@/components/ui/card";
import styles from "./resume-page-container.module.scss";

const contacts = [
  { icon: Mail, label: "hello@ethanpark.dev" },
  { icon: Globe, label: "ethanpark.dev" },
  { icon: MapPin, label: "Seoul, South Korea" },
  { icon: Linkedin, label: "linkedin.com/in/ethanpark" },
  { icon: Github, label: "github.com/ethanpark" },
];

export function ResumePageContainer() {
  return (
    <main className={styles.resume}>
      <Card className={styles.resume__hero}>
        <div className={styles.resume__heroGrid}>
          <div className={styles.resume__photo}><Image src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=800&auto=format&fit=crop" alt="profile" fill className="object-cover" /></div>
          <div>
            <h1 className={styles.resume__name}>Ethan Park</h1>
            <p className={styles.resume__title}>Product Designer & Frontend Engineer</p>
            <p className={styles.resume__summary}>Designing thoughtful digital products with clarity, systems thinking, and strong execution.</p>
            <div className={styles.resume__contacts}>{contacts.map(({icon:Icon,label}) => <Card key={label} className={styles.resume__contactItem}><Icon size={20} color="#2563eb"/>{label}</Card>)}</div>
          </div>
        </div>
      </Card>
      <div className={styles.resume__sections}><AboutSection /><ExperienceSection /></div>
    </main>
  );
}
