import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Destinations - VoyageVista',
  description: 'Discover amazing travel destinations around the world. Explore popular places and hidden gems for your next adventure.',
  keywords: 'travel destinations, tourist spots, vacation places, travel guides',
  openGraph: {
    title: 'Destinations - VoyageVista',
    description: 'Discover amazing travel destinations around the world',
    type: 'website',
  },
};

export default function DestinationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
