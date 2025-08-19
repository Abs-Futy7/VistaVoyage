import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BiMapPin } from 'react-icons/bi';
import { FaCalendarDays } from 'react-icons/fa6';
import { BsStar } from 'react-icons/bs';

interface HomePackageCardProps {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
}

const HomePackageCard: React.FC<HomePackageCardProps> = ({
  id,
  title,
  imageUrl,
  price,
}) => {
  const [imgSrc, setImgSrc] = useState(imageUrl);
  
  // Check if URL is definitely invalid and use fallback immediately
  const isInvalidUrl = (url: string) => {
    return url.includes('tywqqefmllgseuvdvoia.supabase.co') || 
           url.includes('example.com');
  };

  // Only use fallback for URLs we know are definitely invalid
  const shouldSkipLoading = isInvalidUrl(imageUrl);
  const effectiveImageUrl = shouldSkipLoading ? '/images/travel-placeholder.svg' : imgSrc;

  const handleImageError = () => {
    console.log(`HomePackageCard: Image failed to load: ${imageUrl}, using fallback`);
    setImgSrc('/images/travel-placeholder.svg');
  };

  console.log(`HomePackageCard ${title}: Original URL: ${imageUrl}, Effective URL: ${effectiveImageUrl}`);

  return (
    <div className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow rounded-lg flex flex-col h-full border-1 border-gray-200 hover:scale-102 duration-300 bg-white">
      <div className="p-0 relative">
        <Image
          src={effectiveImageUrl}
          alt={title}
          width={600}
          height={400}
          className="w-full h-48 object-cover"
          onError={handleImageError}
        />
      </div>
      <div className="p-4 flex-grow bg-gradient-to-t from-white to-blue-100">
        <h3 className="text-2xl font-[Bebas_Neue] mb-2 tracking-wide h-14 overflow-hidden text-gray-700">
          {title}
        </h3>
      </div>
      <div className="p-4 flex justify-between items-center border-t">
        <div>
          <span className="text-lg font-bold text-blue-600">TK {price.toLocaleString()}</span>
          <span className="text-xs text-gray-500"> /person</span>
        </div>
        <Link 
          href={`/packages/${id}`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default HomePackageCard;
