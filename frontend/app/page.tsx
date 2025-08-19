'use client';

import AboutUs from "@/components/AboutUs";
import Faq from "@/components/Faq";
import Hero from "@/components/Hero";
import PopularPackages from "@/components/PopularPackages";
import TopDestinations from "@/components/TopDestinations";
import TravelBlogs from "@/components/TravelBlogs";


export default function Home() {
  return (
    <div className="bg-white min-h-screen text-gray-800">
      <Hero />
      <PopularPackages />
      <TopDestinations/>
      <TravelBlogs/>
      <AboutUs/>
      <Faq/>
    </div>
  );
}
