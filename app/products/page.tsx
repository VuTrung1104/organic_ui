import Header from '../components/Header';
import ProductsSection from '../components/ProductsSection';
import Footer from '../components/Footer';

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
