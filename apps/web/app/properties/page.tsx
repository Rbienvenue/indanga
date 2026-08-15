import { Footer } from "@/components/home/footer";
import { Navbar } from "@/components/home/navbar";
import { PropertyFeed } from "@/components/houses/property-feed";

export default function PropertiesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar solid />
      <div className="flex-1 pt-18">
        <PropertyFeed />
      </div>
      <Footer />
    </div>
  );
}
