import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Travel Blogs - VoyageVista',
  description: 'Read inspiring travel stories, tips, and guides from fellow travelers. Get insights for your next journey.',
  keywords: 'travel blogs, travel stories, travel tips, travel guides, travel experiences',
  openGraph: {
    title: 'Travel Blogs - VoyageVista',
    description: 'Read inspiring travel stories and tips from fellow travelers',
    type: 'website',
  },
};

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
