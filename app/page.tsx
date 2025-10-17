"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Pagination } from "@/components/ui/pagination";

interface Product {
  stacklineSku: string;
  title: string;
  categoryName: string;
  subCategoryName: string;
  imageUrls: string[];
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Initialize state from URL parameters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    searchParams.get("category") || undefined
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<
    string | undefined
  >(searchParams.get("subcategory") || undefined);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  
  const itemsPerPage = parseInt(searchParams.get("limit") || "20");
  const offset = (currentPage - 1) * itemsPerPage;

  // Function to update URL with current filter state
  const updateURL = (
    newSearch?: string | null, 
    newCategory?: string | null, 
    newSubCategory?: string | null, 
    newPage?: number
  ) => {
    const params = new URLSearchParams();
    
    // Use null to explicitly clear a parameter, undefined to keep current value
    const finalSearch = newSearch !== undefined ? (newSearch || "") : search;
    const finalCategory = newCategory !== undefined ? (newCategory || undefined) : selectedCategory;
    const finalSubCategory = newSubCategory !== undefined ? (newSubCategory || undefined) : selectedSubCategory;
    const finalPage = newPage !== undefined ? newPage : currentPage;
    
    if (finalSearch) params.set("search", finalSearch);
    if (finalCategory) params.set("category", finalCategory);
    if (finalSubCategory) params.set("subcategory", finalSubCategory);
    if (finalPage > 1) params.set("page", finalPage.toString());
    if (itemsPerPage !== 20) params.set("limit", itemsPerPage.toString());
    
    const newURL = params.toString() ? `/?${params.toString()}` : "/";
    router.push(newURL, { scroll: false });
  };

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories);
        
        // Clear invalid category selection if it doesn't exist in API data
        if (selectedCategory && !data.categories.includes(selectedCategory)) {
          setSelectedCategory(undefined);
          setSelectedSubCategory(undefined);
          updateURL(search, null, null, 1);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetch(`/api/subcategories?category=${encodeURIComponent(selectedCategory)}`)
        .then((res) => res.json())
        .then((data) => {
          setSubCategories(data.subCategories);
          
          // Clear invalid subcategory selection if it doesn't exist in API data
          if (selectedSubCategory && !data.subCategories.includes(selectedSubCategory)) {
            setSelectedSubCategory(undefined);
            updateURL(search, selectedCategory, null, 1);
          }
        });
    } else {
      setSubCategories([]);
      if (selectedSubCategory) {
        setSelectedSubCategory(undefined);
        updateURL(search, selectedCategory, null, 1);
      }
    }
  }, [selectedCategory]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedSubCategory) params.append("subCategory", selectedSubCategory);
    params.append("limit", itemsPerPage.toString());
    params.append("offset", offset.toString());

    fetch(`/api/products?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products);
        setTotalProducts(data.total);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, [search, selectedCategory, selectedSubCategory, currentPage, offset]);

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold mb-6">StackShop</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  const newSearch = e.target.value;
                  setSearch(newSearch);
                  setCurrentPage(1);
                  updateURL(newSearch, selectedCategory, selectedSubCategory, 1);
                }}
                className="pl-10"
              />
            </div>

            <Select
              value={selectedCategory || ""}
              onValueChange={(value) => {
                const newCategory = value || undefined;
                setSelectedCategory(newCategory);
                setSelectedSubCategory(undefined);
                setCurrentPage(1);
                updateURL(search, newCategory, null, 1);
              }}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCategory && subCategories.length > 0 && (
              <Select
                value={selectedSubCategory}
                onValueChange={(value) => {
                  const newSubCategory = value || undefined;
                  setSelectedSubCategory(newSubCategory);
                  setCurrentPage(1);
                  updateURL(search, selectedCategory, newSubCategory, 1);
                }}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Subcategories" />
                </SelectTrigger>
                <SelectContent>
                  {subCategories.map((subCat) => (
                    <SelectItem key={subCat} value={subCat}>
                      {subCat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {(search || selectedCategory || selectedSubCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory(undefined);
                  setSelectedSubCategory(undefined);
                  setCurrentPage(1);
                  updateURL("", null, null, 1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalProducts}
              itemsOnCurrentPage={products.length}
              onPageChange={(page: number) => {
                setCurrentPage(page);
                updateURL(search, selectedCategory, selectedSubCategory, page);
              }}
              itemName="products"
              loading={loading}
              className="mb-4"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.stacklineSku}
                  href={`/product/${product.stacklineSku}`}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-muted">
                        {product.imageUrls && product.imageUrls[0] && (
                          <Image
                            src={product.imageUrls[0]}
                            alt={product.title}
                            fill
                            className="object-contain p-4"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <CardTitle className="text-base line-clamp-2 mb-2">
                        {product.title}
                      </CardTitle>
                      <CardDescription className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">
                          {product.categoryName}
                        </Badge>
                        <Badge variant="outline">
                          {product.subCategoryName}
                        </Badge>
                      </CardDescription>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}