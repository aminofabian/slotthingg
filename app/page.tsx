import Image from "next/image";
import Navbar from "./components/Homepage/Navbar";
import HeroSection from "./components/Homepage/HeroSection";
import GamesSection from "./components/Games/GamesSection";
import LicenseSection from "./components/License/LicenseSection";
import Footer from "./components/Footer/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <GamesSection />
      <LicenseSection />
      <Footer />
    </main>
  );
}
