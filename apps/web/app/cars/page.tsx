import { Navbar } from "@/components/home/navbar";
import { Footer } from "@/components/home/footer";
import { PropertyFeed } from "@/components/houses/property-feed";

export default function CarsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar solid />
      <div className="flex-1 pt-31 lg:pt-18">
        <PropertyFeed lockedType="cars" />
      </div>
      <Footer />
    </div>
  );
}
