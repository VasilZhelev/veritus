import { HeroSection } from "@/components/sections/hero";

export default function Home() {
  return (
    <HeroSection
      badge={{
        text: "Introducing",
        action: { text: "Read more", href: "/" },
      }}
      title="Choosing a car made easy"
      description="We'll help you find the perfect car for your needs."
      actions={[
        { text: "Get Started", href: "/", variant: "default" },
        { text: "View Docs", href: "/", variant: "outline" },
      ]}
      image={{
        light: "https://www.launchuicomponents.com/app-dark.png",
        dark: "https://www.launchuicomponents.com/app-dark.png",
        alt: "Hero preview",
      }}
    />
  );
}
