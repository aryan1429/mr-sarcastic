import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation />
      <PageTransition>
        <main>
          <Hero />
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default Index;
