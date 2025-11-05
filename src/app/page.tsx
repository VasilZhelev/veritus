import { HeroSection } from "@/components/sections/hero";

export default function Home() {
  return (
    <HeroSection
      badge={{
        text: "Introducing",
        action: { text: "Read more", href: "/" },
      }}
      title="Build faster with Veritus"
      description="Modern components and utilities powered by shadcn/ui and Next.js."
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
