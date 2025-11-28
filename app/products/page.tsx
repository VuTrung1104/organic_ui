import { Header, Footer } from '../components/layout';
import { ProductsSection } from '../components/sections';

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20">
        <ProductsSection />
      </main>
      <Footer />
    </div>
  );
}
