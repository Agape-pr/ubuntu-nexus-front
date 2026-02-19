import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Package, Heart, Share2, MessageCircle } from "lucide-react";

const STORE_DATA: Record<string, {
  name: string;
  slug: string;
  description: string;
  location: string;
  emoji: string;
  rating: number;
  reviewCount: number;
  memberSince: string;
  products: {
    id: string; name: string; price: number; category: string; rating: number; reviewCount: number;
  }[];
}> = {
  "nyirangarama-fashion": {
    name: "Nyirangarama Fashion",
    slug: "nyirangarama-fashion",
    description: "Handcrafted African fashion made with love in Kigali. Authentic Ankara prints, embroidered accessories, and wearable art for every occasion.",
    location: "Kigali, Rwanda",
    emoji: "👗",
    rating: 4.8,
    reviewCount: 124,
    memberSince: "January 2024",
    products: [
      { id: "1", name: "Ankara Print Tote Bag", price: 12500, category: "Fashion", rating: 4.8, reviewCount: 24 },
      { id: "7", name: "Hand-Embroidered Table Runner", price: 9500, category: "Home", rating: 4.8, reviewCount: 9 },
      { id: "9", name: "Kitenge Wrap Skirt", price: 18000, category: "Fashion", rating: 4.9, reviewCount: 37 },
    ],
  },
  "kigali-crafts": {
    name: "Kigali Crafts",
    slug: "kigali-crafts",
    description: "Traditional Rwandan craftsmanship for the modern home. Every piece tells a story of culture, skill, and pride.",
    location: "Nyamirambo, Kigali",
    emoji: "🧺",
    rating: 4.9,
    reviewCount: 89,
    memberSince: "March 2024",
    products: [
      { id: "2", name: "Handwoven Agaseke Basket", price: 8000, category: "Crafts", rating: 5, reviewCount: 18 },
      { id: "5", name: "Imigongo Art Print (A3)", price: 15000, category: "Crafts", rating: 4.7, reviewCount: 13 },
    ],
  },
};

const StorePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const store = slug ? STORE_DATA[slug] : null;

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Store not found</h2>
          <p className="text-muted-foreground mb-6">
            This store doesn't exist or may have moved.
          </p>
          <Link to="/marketplace">
            <Button className="rounded-xl">Browse marketplace</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Store Header */}
      <div className="bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-emerald blur-3xl" />
        </div>
        <div className="relative container py-12">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {/* Store Avatar */}
            <div className="h-24 w-24 rounded-2xl bg-primary-foreground/10 border-2 border-primary-foreground/20 flex items-center justify-center text-4xl flex-shrink-0 backdrop-blur-sm">
              {store.emoji}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-primary-foreground">{store.name}</h1>
                <span className="px-2.5 py-1 rounded-full bg-emerald/20 text-emerald text-xs font-medium border border-emerald/30 mt-1.5">
                  Verified seller
                </span>
              </div>
              <p className="text-primary-foreground/70 max-w-lg mb-3">{store.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/60">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  {store.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star size={13} className="fill-accent text-accent" />
                  {store.rating} ({store.reviewCount} reviews)
                </span>
                <span className="flex items-center gap-1.5">
                  <Package size={13} />
                  {store.products.length} products
                </span>
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" className="rounded-xl border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10 gap-2">
                <Heart size={14} />
                Follow
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10 gap-2">
                <Share2 size={14} />
                Share
              </Button>
              <Button size="sm" className="gradient-amber text-accent-foreground rounded-xl border-0 gap-2">
                <MessageCircle size={14} />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container py-10 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            Products <span className="text-muted-foreground font-normal text-base">({store.products.length})</span>
          </h2>
        </div>

        {store.products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="font-semibold text-foreground mb-2">No products yet</h3>
            <p className="text-muted-foreground text-sm">
              This seller is setting up their store. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {store.products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                storeName={store.name}
                storeSlug={store.slug}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default StorePage;
