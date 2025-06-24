import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { BsArrowRight } from 'react-icons/bs';
import { MapPin } from 'lucide-react';

interface DestinationProps {
  destination: {
    id: string;
    name: string;
    imageUrl: string;
    country: string;
    imageHint?: string;
    region?: string;
    description?: string;
  };
}

const DestinationCard = ({ destination }: DestinationProps) => {
  const { id, name, imageUrl, country, imageHint, description } = destination;

  return (
    <div className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg group border border-gray-200/20 hover:scale-[1.02]">
      <div className="relative h-80 w-full">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          data-ai-hint={imageHint || `${name} landscape`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        <div className="absolute top-4 left-4 flex items-center bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
          <MapPin className="h-4 w-4 text-yellow-400 mr-1.5" />
          <span className="text-white text-sm font-medium">{country}</span>
        </div>
        
        <div className="absolute bottom-0 left-0 p-6">
          <h3 className="text-4xl font-headline font-semibold text-white mb-1">
            {name}
          </h3>
          <p className="text-white/80 font-light mb-6 line-clamp-2">
            {description || `Explore the wonders of ${name} and discover its unique culture and landscapes.`}
          </p>
        </div>
        
        {/* Explore button positioned at bottom right */}
        <div className="absolute bottom-6 right-6">
          <Link 
            href={`/destinations/${id}`}
            className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-colors flex items-center shadow-lg group-hover:scale-105 duration-300"
          >
            Explore <BsArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;