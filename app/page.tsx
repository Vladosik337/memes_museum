import ActionSection from "../components/ActionSection";
import CurrentExhibitionsSection from "../components/CurrentExhibitionsSection";
import Footer from "../components/Footer";
import Header from "../components/Header";
import MemesGallerySection from "../components/MemesGallerySection";
import PricingSection from "../components/PricingSection";
import PromoSection from "../components/PromoSection";
import VisitRulesSection from "../components/VisitRulesSection";
import "../public/style.css";

export default function Home() {
  return (
    <>
      <Header />
      <PromoSection />
      <ActionSection />
      <CurrentExhibitionsSection />
      <PricingSection />
      <MemesGallerySection />
      <VisitRulesSection />
      <Footer />
    </>
  );
}
