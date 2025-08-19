import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Travel Packages - VoyageVista',
  description: 'Explore amazing travel packages and destinations worldwide. Find the perfect vacation package for your next adventure.',
  keywords: 'travel packages, vacation packages, tours, destinations, travel deals',
  openGraph: {
    title: 'Travel Packages - VoyageVista',
    description: 'Explore amazing travel packages and destinations worldwide',
    type: 'website',
  },
};

export default function PackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
