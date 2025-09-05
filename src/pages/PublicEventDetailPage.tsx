import PublicEventDetailView from "@/components/PublicEventDetailView";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PublicEventDetailPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <PublicEventDetailView />
      <Footer />
    </div>
  );
};

export default PublicEventDetailPage;