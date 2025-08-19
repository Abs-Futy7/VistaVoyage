import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BiMapPin } from 'react-icons/bi';
import { FaCalendarDays } from 'react-icons/fa6';

// Define the package info type
interface PackageInfo {
  id: string;
  title: string;
  destination: string;
  duration: string;
  imageUrl: string;
  imageHint?: string;
  price: number;
}


interface PackageCardProps {
  packageInfo: PackageInfo;
}
function PackageCard({ packageInfo }: PackageCardProps) {
  const [imgSrc, setImgSrc] = useState(packageInfo.imageUrl);
  
  // Use the image URL directly, let error handling deal with invalid URLs
  const effectiveImageUrl = imgSrc || '/images/travel-placeholder.svg';

  const handleImageError = () => {
    console.log(`PackageCard: Image failed to load: ${packageInfo.imageUrl}, using fallback`);
    setImgSrc('/images/travel-placeholder.svg');
  };

  console.log(`PackageCard ${packageInfo.title}: Original URL: ${packageInfo.imageUrl}, Effective URL: ${effectiveImageUrl}`);

  return (
    <div className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow rounded-lg flex flex-col h-full border-1 border-gray-200 hover:scale-102 duration-300">
      {/* Header/Image Section */}
      <div className="p-0 relative">
        <Image
          src={effectiveImageUrl}
          alt={packageInfo.title}
          width={600}
          height={400}
          className="w-full h-56 object-cover"
          onError={handleImageError}
        />
      </div>
      {/* Content Section */}
      <div className="p-6 flex-grow bg-gradient-to-t from-white to-blue-200">
        <h3 className="text-3xl font-[Bebas_Neue] mb-3 tracking-wide min-h-[4rem] leading-tight text-gray-700">
          {packageInfo.title}
        </h3>
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex items-center">
            <BiMapPin className="h-4 w-4 mr-2 text-gray-600" />
            <span>{packageInfo.destination}</span>
          </div>
          <div className="flex items-center">
            <FaCalendarDays className="h-4 w-4 mr-2 text-gray-600" />
            <span>{packageInfo.duration}</span>
          </div>
        </div>
      </div>
      {/* Footer Section */}
      <div className="p-6 flex justify-between items-center border-t">
        <div>
          <span className="text-lg font-bold text-blue-600">TK {packageInfo.price.toLocaleString()}</span>
          <span className="text-xs text-gray-500"> /person</span>
        </div>
        <Link 
          href={`/packages/${packageInfo.id}`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default PackageCard;
