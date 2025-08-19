import Image from "next/image";
import React from "react";
import { Button } from "./ui/moving-border";
import Link from "next/link";
import HeroExperience from "./HeroExperience";

function Hero() {
  return (
    <section className="font-[Bebas_Neue] relative h-[calc(100vh-5rem)] min-h-[500px] flex items-center justify-center text-center text-white overflow-hidden">
      <Image
        src="/images/bg1.jpg"
        alt="Background"
        fill
        style={{ objectFit: 'cover' }}
        className="absolute inset-0 z-0"
        priority
      />
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative inline-block">
          <h1 className="font-[Bebas_Neue] text-4xl sm:text-5xl md:text-8xl font-headline font-normal mb-6 drop-shadow-lg bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Unforgetable Journeys Await <br />
            The Adventurer
          </h1>
            <div
            className="
              hidden
              lg:block
              absolute
              lg:top-[-20px] lg:left-[-50px] lg:w-[160px] lg:h-[160px]
              xl:top-[-25px] xl:left-[-60px] xl:w-[180px] xl:h-[180px]
              pointer-events-none
              z-10
            "
            >
            <HeroExperience />
            </div>
        </div>
        <p className="text-lg sm:text-2xl md:text-2xl mb-10 max-w-3xl mx-auto drop-shadow-md font-extralight">
          Explore breathtaking destinations and unique travel packages curated
          just for you.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:bg-white/10  text-xl px-8 py-3 rounded-md shadow-lg transition-transform hover:scale-105 min-w-full border-white"
          >
            <Link href="/packages">Explore Packages</Link>
          </Button>
          <Button
            size="lg"
            className="border-blue-600 bg-gray-200 text-blue-800 hover:bg-white/10 text-xl px-8 py-3 rounded-md shadow-lg transition-transform hover:scale-105 hover:text-white"
          >
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
