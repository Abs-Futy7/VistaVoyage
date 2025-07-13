import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BiMapPin } from 'react-icons/bi';
import { FaCalendarDays } from 'react-icons/fa6';
import { BsStar } from 'react-icons/bs';

// Define the package info type
interface PackageInfo {
  id: string;
  title: string;
  destination: string;
  duration: string;
  imageUrl: string;
  imageHint?: string;
  price: number;
  rating: number;
}


interface PackageCardProps {
  packageInfo: PackageInfo;
}
function PackageCard({ packageInfo }: PackageCardProps) {
  return (
    <div className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow rounded-lg flex flex-col h-full border-1 border-gray-200 hover:scale-102 duration-300">
      {/* Header/Image Section */}
      <div className="p-0 relative">
        <Image
          src={packageInfo.imageUrl}
          alt={packageInfo.title}
          width={600}
          height={400}
          className="w-full h-48 object-cover"
        />
      </div>
      {/* Content Section */}
      <div className="p-4 flex-grow bg-gradient-to-t from-white to-blue-200">
        <h3 className="text-4xl font-[Bebas_Neue] mb-2 tracking-wide h-14 overflow-hidden text-gray-700">
          {packageInfo.title}
        </h3>
        <div className="text-sm text-gray-600 space-y-1.5">
          <div className="flex items-center">
            <BiMapPin className="h-4 w-4 mr-2 text-gray-600" />
            <span>{packageInfo.destination}</span>
          </div>
          <div className="flex items-center">
            <FaCalendarDays className="h-4 w-4 mr-2 text-gray-600" />
            <span>{packageInfo.duration}</span>
          </div>
          <div className="flex items-center">
            <BsStar className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500" />
            <span>{packageInfo.rating.toFixed(1)} / 5.0</span>
          </div>
        </div>
      </div>
      {/* Footer Section */}
      <div className="p-4 flex justify-between items-center border-t">
        <div>
          <span className="text-lg font-bold text-blue-600">${packageInfo.price.toLocaleString()}</span>
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
