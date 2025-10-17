## 1. Individual Product Routing

**Issue**: Product page was receiving entire product object as URL parameter instead of using the SKU.
- Security risk: Exposing full product data in URL
- Poor UX: Extremely long, unreadable URLs
- Not scalable: URL length grows with product data size

**Fix**: Used Next.js dynamic routing with SKU parameter
```js
// Before: /product?data={entire-product-object}
// After: /product/ABC123

const params = useParams();
const sku = String(params.sku);
const [product, setProduct] = useState<Product | null>(null);

useEffect(() => {
  fetch(`/api/products/${sku}`)
    .then((res) => res.json())
    .then((data) => setProduct(data));
}, [sku]);
```

**Why**: Clean URLs, better security, leverages existing API endpoint structure.

## 2. Subcategory API Query

**Issue**: Subcategory dropdown wasn't filtering by selected category - showing all subcategories instead of relevant ones.

**Fix**: Include category parameter in subcategory API call
```js
// Before
fetch(`/api/subcategories`)

// After  
fetch(`/api/subcategories?category=${encodeURIComponent(selectedCategory)}`)
```

**Why**: Subcategories should only show options relevant to the selected category.
## 3. Select Component Clear Issue

**Issue**: Radix UI Select components didn't visually clear when filters were reset - still showed previous selection.

**Fix**: Use empty string instead of undefined for "no selection" state
```js
// Before
<Select value={selectedCategory}>

// After
<Select value={selectedCategory || ""}>
```

**Why**: Radix UI doesn't properly handle `undefined` values but correctly clears display with empty strings.


## 4. URL State Management

**Issue**: Filter selections and pagination weren't reflected in URL parameters.
- Users couldn't bookmark filtered results
- Browser back/forward buttons didn't work
- Poor SEO and analytics tracking

**Fix**: Sync all filters and pagination with URL parameters
```js
const updateURL = (newSearch, newCategory, newSubCategory, newPage) => {
  const params = new URLSearchParams();
  if (newSearch) params.set("search", newSearch);
  if (newCategory) params.set("category", newCategory);
  if (newSubCategory) params.set("subcategory", newSubCategory);
  if (newPage > 1) params.set("page", newPage.toString());
  
  router.push(`/?${params.toString()}`);
};
```

**Why**: Enables bookmarking, proper browser navigation, and better user experience.

## 5. Missing Pagination

**Issue**: Users could only see the first 20 products with no way to navigate to additional results.

**Fix**: Added pagination component with page controls
```jsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={(page) => {
    setCurrentPage(page);
    updateURL(search, selectedCategory, selectedSubCategory, page);
  }}
/>
```

**Why**: Essential for browsing large product catalogs - users need access to all products.

## 6. Image Safety Checks

**Issue**: App crashed when products had missing or empty `imageUrls` arrays.

**Fix**: Added proper null/undefined checks before accessing image arrays
```js
// Before
{product.imageUrls[0] && (
  <Image src={product.imageUrls[0]} />
)}

// After
{product.imageUrls && product.imageUrls[0] && (
  <Image src={product.imageUrls[0]} />
)}
```

Applied same pattern to:
- Image carousel navigation
- Feature bullets display
- Product image gallery

**Why**: Prevents runtime errors when product data is incomplete.

## 7. Incomplete Filter Clearing

**Issue**: "Clear Filters" button only cleared search input, not category/subcategory selections.

**Fix**: Reset all filter states when clearing
```js
<Button onClick={() => {
  setSearch("");
  setSelectedCategory(undefined);
  setSelectedSubCategory(undefined);
  setCurrentPage(1);
  updateURL("", null, null, 1);
}}>
  Clear Filters
</Button>
```

**Why**: Users expect "Clear Filters" to reset ALL filters, not just search.

## 8. Image Hostname Configuration

**Issue**: Next.js blocked external Amazon image URLs, causing image loading failures.

**Error**: `Invalid src prop, hostname "images-na.ssl-images-amazon.com" is not configured`

**Fix**: Added Amazon image domains to Next.js config
```js
// next.config.ts
module.exports = {
  images: {
    ...
    domains: ['images-na.ssl-images-amazon.com']
  }
}
```

**Why**: Next.js requires explicit allowlisting of external image domains for security.