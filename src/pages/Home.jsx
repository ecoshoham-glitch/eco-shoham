import React from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import ResearchTicker from '../components/landing/ResearchTicker';
import ProblemSolution from '../components/landing/ProblemSolution';
import ImageBanner from '../components/landing/ImageBanner';
import ScienceProof from '../components/landing/ScienceProof';
import BlogSection from '../components/landing/BlogSection';
import ProductShowcase from '../components/landing/ProductShowcase';
import AboutSection from '../components/landing/AboutSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import ContactSection from '../components/landing/ContactSection';
import FAQSection from '../components/landing/FAQSection';
import Footer from '../components/landing/Footer';

export default function Home() {
  return (
    <div className="font-heebo">
      <Navbar />
      <HeroSection />
      <div className="relative z-10 bg-background">
        <ResearchTicker />
        <ProblemSolution />
        <ImageBanner />
        <ScienceProof />
        <BlogSection />
        <ProductShowcase />
        <AboutSection />
        <TestimonialsSection />
        <FAQSection />
        <Footer />
      </div>
      <ContactSection />
    </div>
  );
}