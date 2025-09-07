import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation />
      <main>
        <Hero />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
