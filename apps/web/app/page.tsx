import { Navbar } from "@/components/home/navbar";
import { Hero } from "@/components/home/hero";
import { SearchBar } from "@/components/home/search-bar";
import { Categories } from "@/components/home/categories";
import { Recommended } from "@/components/home/recommended";
import { WhyChoose } from "@/components/home/why-choose";
import { HowItWorks } from "@/components/home/how-it-works";
import { CTASection } from "@/components/home/cta-section";
import { Footer } from "@/components/home/footer";
import { AboutSection } from "@/components/home/about-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <SearchBar redirectTo="/properties" />
        <Categories />
        <Recommended />
        <HowItWorks />
        <WhyChoose />
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
