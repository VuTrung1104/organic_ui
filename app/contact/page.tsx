import { Header, Footer } from '../components/layout';
import { ContactSection } from '../components/sections';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Header />
      <main className="pt-20">
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
