import React from 'react';
import { GiCompass, GiDiamondHard, GiPiggyBank, GiStarsStack } from 'react-icons/gi';

function AboutUs() {
  // Features with personalized icons and descriptions
  const features = [
    {
      icon: <GiCompass className="h-12 w-12 text-white" />,
      title: "Expert Curated Trips",
      description: "Our travel experts handpick every destination and craft unique itineraries based on years of experience."
    },
    {
      icon: <GiPiggyBank className="h-12 w-12 text-white" />,
      title: "Best Price Guarantee",
      description: "We promise competitive pricing without compromising on quality or memorable experiences."
    },
    {
      icon: <GiStarsStack className="h-12 w-12 text-white" />,
      title: "Personalized Service",
      description: "Your journey is as unique as you are. We tailor every detail to match your travel preferences."
    },
    {
      icon: <GiDiamondHard className="h-12 w-12 text-white" />,
      title: "Premium Experience",
      description: "From luxury accommodations to VIP access at destinations, we elevate every aspect of your travel."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-[#dfe8ff]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-gray-700 mb-6">
            Why Choose <span className="text-blue-900">VoyageVista</span>?
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            We don't just plan trips, we craft unforgettable journeys tailored to your travel dreams.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 ">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gradient-to-b bg-[#a0cff6] to-white rounded-xl p-8 text-center transform transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-white/15 border-1 border-blue-700/50 hover:border-blue-700/70 hover:backdrop-blur-lg hover:shadow-blue-500/30 hover:text-gray-900"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500 mb-6 mx-auto border-1 border-black/20 hover:border-blue-700/70 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-headline font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-800">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        
      </div>
    </section>
  );
}

export default AboutUs;
