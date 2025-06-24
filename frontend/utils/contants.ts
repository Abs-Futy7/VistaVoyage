

export const navLinks = [
  { href: "/",  label: "Home" },
  { href: "/packages", label: "Packages" },
  { href: "/destinations", label: "Destinations" },
  { href: "/offers", label: "Offers" },
  { href: "/blogs", label: "Blogs" },
  { href: "/faq", label: "FAQs" },
];

export const mockPackages = [
  {
    id: "pkg1",
    title: "Parisian Dreams",
    destination: "Paris, France",
    duration: "7 Days / 6 Nights",
    price: 1200,
    rating: 4.5,
    imageUrl: "/images/bali.png",
    imageHint: "paris eiffel",
    tripType: "Cultural",
    description:
      "Experience the magic of Paris, from the Eiffel Tower to the Louvre.",
  },
  {
    id: "pkg2",
    title: "Roman Holiday",
    destination: "Rome, Italy",
    duration: "5 Days / 4 Nights",
    price: 950,
    rating: 4.8,
    imageUrl: "/images/bali.png",
    imageHint: "rome colosseum",
    tripType: "Historical",
    description:
      "Explore ancient ruins and vibrant culture in the heart of Italy.",
  },
  {
    id: "pkg3",
    title: "Tokyo Adventure",
    destination: "Tokyo, Japan",
    duration: "10 Days / 9 Nights",
    price: 2200,
    rating: 4.7,
    imageUrl: "/images/bali.png",
    imageHint: "tokyo city",
    tripType: "Modern",
    description:
      "Discover the bustling metropolis and serene temples of Tokyo.",
  },
  {
    id: "pkg4",
    title: "Bali Beaches",
    destination: "Bali, Indonesia",
    duration: "8 Days / 7 Nights",
    price: 1500,
    rating: 4.6,
    imageUrl: "/images/bali.png",
    imageHint: "bali beach",
    tripType: "Relaxation",
    description:
      "Relax on pristine beaches and enjoy the spiritual ambiance of Bali.",
  },
];

export const mockDestinations = [
  {
    id: "dest1",
    name: "Kyoto",
    imageUrl: "/images/tokyo.webp",
    imageHint: "kyoto temple",
    country: "Japan",
    region: "Asia",
  },
  {
    id: "dest2",
    name: "Santorini",
    imageUrl: "/images/tokyo.webp",
    imageHint: "santorini island",
    country: "Greece",
    region: "Europe",
  },
  {
    id: "dest3",
    name: "Machu Picchu",
    imageUrl: "/images/tokyo.webp",
    imageHint: "machu picchu",
    country: "Peru",
    region: "South America",
  },
  {
    id: "dest4",
    name: "New York City",
    imageUrl: "/images/tokyo.webp",
    imageHint: "new york city",
    country: "USA",
    region: "North America",
  },
];

export const mockBlogs = [
  {
    id: "blog1",
    slug: "top-10-travel-hacks",
    title: "Top 10 Travel Hacks for 2024",
    imageUrl: "/images/blog.jpg",
    imageHint: "travel planning",
    excerpt:
      "Save money and travel smarter with these essential tips and tricks.",
    author: "Jane Doe",
    date: "2024-07-15",
    category: "Travel Tips",
    tags: ["Tips", "Travel"],
  },
  {
    id: "blog2",
    slug: "hidden-gems-southeast-asia",
    title: "Hidden Gems of Southeast Asia",
    imageUrl: "/images/blog.jpg",
    imageHint: "asia landscape",
    excerpt:
      "Discover breathtaking, off-the-beaten-path destinations in Southeast Asia.",
    author: "John Smith",
    date: "2024-07-10",
    category: "Destinations",
    tags: ["Adventure", "Culture"],
  },
];

export const whyChooseUsItems = [
  {
    title: "Expert Curated Trips",
    description: "Handpicked destinations and itineraries by travel experts.",
  },
  {
    title: "Best Price Guarantee",
    description: "Find the best deals for your dream vacation.",
  },
  {
    title: "24/7 Support",
    description: "Dedicated support throughout your journey.",
  },
  {
    title: "Safe & Secure Booking",
    description: "Your data and payments are protected with top-tier security.",
  },
];

export const mockFAQs = [
  {
    question: "How do I book a package?",
    answer:
      'You can book a package by navigating to the package details page and clicking the "Book Now" button. You will be guided through the payment process.',
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept major credit cards (Visa, MasterCard, American Express) and PayPal.",
  },
  {
    question: "Can I cancel my booking?",
    answer:
      "Yes, you can cancel your booking. Please refer to our cancellation policy for details on refunds and charges. The policy can be found in the terms and conditions section.",
  },
  {
    question: "Is travel insurance included?",
    answer:
      "Travel insurance is not automatically included but can be added as an optional extra during the booking process. We highly recommend purchasing travel insurance.",
  },
];

export const mockItinerary = [
  {
    day: 1,
    title: "Arrival and Check-in",
    description:
      "Arrive at your destination, check into your hotel, and enjoy some leisure time.",
  },
  {
    day: 2,
    title: "City Exploration",
    description:
      "Guided tour of the city's main attractions and historical sites.",
  },
  {
    day: 3,
    title: "Cultural Immersion",
    description:
      "Visit local markets, museums, and experience the local culture.",
  },
];

export const mockActivities = [
  "Guided City Tour",
  "Museum Visits",
  "Local Cuisine Tasting",
  "Shopping",
];

export const mockPackageOffers = [
  "10% off on spa treatments",
  "Complimentary breakfast",
];

export const mockReviews = [
  {
    id: "rev1",
    userName: "Alice",
    rating: 5,
    comment: "Amazing experience! Highly recommended.",
    date: "2024-07-01",
    userAvatarUrl: "/images/Simple_User_Icon.png",
  },
  {
    id: "rev2",
    userName: "Bob",
    rating: 4,
    comment: "Great package, good value for money.",
    date: "2024-06-20",
    userAvatarUrl: "/images/Simple_User_Icon.png",
  },
];

export const mockHotels = [
  {
    id: "hotel1",
    name: "Hotel Paris",
    location: "Paris, France",
    rating: 4.5,
    pricePerNight: 200,
    imageUrl: "/images/hotel1.jpg",
    imageHint: "hotel paris",
  },
  {
    id: "hotel2",
    name: "Rome Grand Hotel",
    location: "Rome, Italy",
    rating: 4.7,
    pricePerNight: 180,
    imageUrl: "/images/hotel2.jpg",
    imageHint: "rome grand hotel",
  },
];

export const BlogComments = [
  {
    name: "Sarah Johnson",
    date: "2 days ago",
    content:
      "I visited Koh Lanta last year and completely agree with everything in this article! The Old Town was my favorite part - such beautiful wooden buildings and friendly people.",
    avatar: "/icons/image.png",
  },
  {
    name: "Michael Chen",
    date: "4 days ago",
    content:
      "Great tips about the night markets! I would add that the seafood BBQ at Klong Khong Beach is also worth checking out. They cook right on the beach as the sun sets.",
    avatar: "/icons/image.png",
  },
  {
    name: "Emma Rodriguez",
    date: "1 week ago",
    content:
      "This article has convinced me to add Koh Lanta to my Thailand itinerary. Any recommendations on specific accommodations that support the local sustainability efforts mentioned?",
    avatar: "/icons/image.png",
  },
];



export const specialOffers = [
  {
    id: 'offer1',
    title: 'Romantic Paris Getaway',
    destination: 'Paris, France',
    imageUrl: '/images/paris.jpg',
    imageHint: 'eiffel tower paris',
    originalPrice: 1499,
    discountedPrice: 1199,
    discountPercentage: 20,
    duration: '5 days / 4 nights',
    summary: 'Fall in love with the City of Light. Includes Eiffel Tower visit, Seine cruise, and luxury accommodation.',
    expiryDate: '2024-08-15',
    tripType: 'Romantic',
    featured: true
  },
  {
    id: 'offer2',
    title: 'Tropical Bali Paradise',
    destination: 'Bali, Indonesia',
    imageUrl: '/images/bali.png',
    imageHint: 'bali beach resort',
    originalPrice: 1899,
    discountedPrice: 1599,
    discountPercentage: 15,
    duration: '7 days / 6 nights',
    summary: 'Experience the ultimate relaxation in Bali\'s top-rated resorts with spa treatments included.',
    expiryDate: '2024-09-10',
    tripType: 'Beach',
    featured: true
  },
  {
    id: 'offer3',
    title: 'Japan Cherry Blossom Tour',
    destination: 'Tokyo & Kyoto, Japan',
    imageUrl: '/images/japan.jpg',
    imageHint: 'cherry blossoms japan',
    originalPrice: 2499,
    discountedPrice: 2099,
    discountPercentage: 16,
    duration: '10 days / 9 nights',
    summary: 'Witness the magical cherry blossom season with guided tours through Japan\'s most beautiful gardens.',
    expiryDate: '2024-09-30',
    tripType: 'Cultural',
    featured: false
  },
  {
    id: 'offer4',
    title: 'Greek Island Hopping',
    destination: 'Santorini & Mykonos, Greece',
    imageUrl: '/images/greece.jpg',
    imageHint: 'santorini white buildings',
    originalPrice: 1799,
    discountedPrice: 1499,
    discountPercentage: 17,
    duration: '8 days / 7 nights',
    summary: 'Island hop through the stunning Greek islands with private boat tours and sunset dinners.',
    expiryDate: '2024-08-20',
    tripType: 'Beach',
    featured: false
  },
  {
    id: 'offer5',
    title: 'Safari Adventure',
    destination: 'Serengeti, Tanzania',
    imageUrl: '/images/safari.jpg',
    imageHint: 'african safari wildlife',
    originalPrice: 3299,
    discountedPrice: 2799,
    discountPercentage: 15,
    duration: '6 days / 5 nights',
    summary: 'Experience the ultimate wildlife adventure with guided safari tours and luxury glamping.',
    expiryDate: '2024-07-30',
    tripType: 'Adventure',
    featured: false
  },
  {
    id: 'offer6',
    title: 'Alpine Ski Retreat',
    destination: 'Swiss Alps, Switzerland',
    imageUrl: '/images/alps.jpg',
    imageHint: 'swiss alps mountains',
    originalPrice: 2199,
    discountedPrice: 1749,
    discountPercentage: 20,
    duration: '6 days / 5 nights',
    summary: 'Hit the slopes with this all-inclusive ski package featuring equipment rental and lessons.',
    expiryDate: '2024-08-25',
    tripType: 'Adventure',
    featured: true
  }
];

export const promoCodes = [
  { code: 'SUMMER2024', discount: '10% off all beach destinations', expiryDate: '2024-08-31' },
  { code: 'EARLYBIRD', discount: '$100 off when you book 3 months in advance', expiryDate: '2024-10-15' },
  { code: 'FAMILYFUN', discount: 'Kids stay free on family packages', expiryDate: '2024-09-15' }
];

export const userMockProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  avatarUrl: "/images/Simple_User_Icon.png",
}


export const mockUserBookings = [
  { id: "BOOK001", packageName: "Parisian Dreams", date: "2024-08-15", status: "Confirmed", total: 1200, packageId: "pkg1" },
  { id: "BOOK002", packageName: "Tokyo Adventure", date: "2024-09-10", status: "Pending", total: 2200, packageId: "pkg3" },
  { id: "BOOK003", packageName: "Bali Beaches", date: "2023-12-01", status: "Completed", total: 1500, packageId: "pkg4" },
];


export const mockAnalyticsData = [
  { title: "Total Users", value: "1,234", change: "+5% last month" },
  { title: "Total Bookings", value: "567", change: "+12% last month" },
  { title: "Total Revenue", value: "$85,670", change: "+8% last month" },
  { title: "Active Packages", value: "42", change: "" },
];