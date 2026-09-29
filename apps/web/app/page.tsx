import { Navbar } from "@/components/home/navbar";
import { Hero } from "@/components/home/hero";
import { SearchBar } from "@/components/home/search-bar";
import { TrustSignals } from "@/components/home/trust-signals";
import { Categories } from "@/components/home/categories";
import { Recommended } from "@/components/home/recommended";
import { HowItWorks } from "@/components/home/how-it-works";
import { ProviderCTA } from "@/components/home/provider-cta";
import { Footer } from "@/components/home/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <SearchBar redirectTo="/properties" />
        <TrustSignals />
        <HowItWorks />
        <Categories />
        <Recommended />
        <HowItWorks />
        <ProviderCTA />
      </main>
      <Footer />
    </div>
  );
}
