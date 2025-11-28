import { Header, Footer } from "./components/layout";
import { HeroSection, AboutSection, ProductsSection } from "./components/sections";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <AboutSection />
      <ProductsSection showViewAll={true} />
      <Footer />
    </div>
  );
}
