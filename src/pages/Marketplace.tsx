import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X } from "lucide-react";

const CATEGORIES = ["All", "Fashion", "Food", "Crafts", "Beauty", "Tech", "Books", "Home"];

const PRODUCTS = [
  { id: "1", name: "Ankara Print Tote Bag", price: 12500, storeName: "Nyirangarama Fashion", storeSlug: "nyirangarama-fashion", category: "Fashion", rating: 4.8, reviewCount: 24 },
  { id: "2", name: "Handwoven Agaseke Basket", price: 8000, storeName: "Kigali Crafts", storeSlug: "kigali-crafts", category: "Crafts", rating: 5, reviewCount: 18 },
  { id: "3", name: "Organic Kinigi Honey (500g)", price: 4500, storeName: "Hills & Harvest", storeSlug: "hills-harvest", category: "Food", rating: 4.6, reviewCount: 41 },
  { id: "4", name: "Rwandan Coffee Arabica Blend", price: 6800, storeName: "Great Lakes Coffee", storeSlug: "great-lakes-coffee", category: "Food", rating: 4.9, reviewCount: 87 },
  { id: "5", name: "Imigongo Art Print (A3)", price: 15000, storeName: "Rwanda Art House", storeSlug: "rwanda-art-house", category: "Crafts", rating: 4.7, reviewCount: 13 },
  { id: "6", name: "Natural Shea Butter Body Cream", price: 3500, storeName: "Ubuzima Beauty", storeSlug: "ubuzima-beauty", category: "Beauty", rating: 4.5, reviewCount: 52 },
  { id: "7", name: "Hand-Embroidered Table Runner", price: 9500, storeName: "Nyirangarama Fashion", storeSlug: "nyirangarama-fashion", category: "Home", rating: 4.8, reviewCount: 9 },
  { id: "8", name: "Kinyarwanda Learning Book Set", price: 5500, storeName: "Kanda Books", storeSlug: "kanda-books", category: "Books", rating: 4.3, reviewCount: 27 },
];

const SORT_OPTIONS = ["Most popular", "Newest", "Price: Low to High", "Price: High to Low"];

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Most popular");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.storeName.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Marketplace</h1>
          <p className="text-muted-foreground">
            {PRODUCTS.length} products from Kigali's finest sellers
          </p>
        </div>
      </div>

      <div className="container py-8 flex-1">
        {/* Search & Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products or stores..."
              className="pl-10 h-11 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 px-4 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={16} />
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-card"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground text-sm">
              Try a different search or category
            </p>
            <Button
              variant="outline"
              className="mt-4 rounded-xl"
              onClick={() => { setSearch(""); setSelectedCategory("All"); }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Marketplace;
