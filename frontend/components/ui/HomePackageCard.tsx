import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
  // Use the same pattern as TopDestinations - simple fallback with default image
  const effectiveImageUrl = imageUrl || "/images/default-package.svg";

  // Log for debugging
  console.log(`HomePackageCard ${title}: Original URL: ${imageUrl}, Effective URL: ${effectiveImageUrl}`);

  return (
    <div className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow rounded-lg flex flex-col h-full border-1 border-gray-200 hover:scale-102 duration-300 bg-white group">
      <div className="p-0 relative h-48">
        <Image
          src={effectiveImageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
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
