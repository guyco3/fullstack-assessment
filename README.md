Hello Stackline team! here are my fixes

## 1. Individual Product Routing

**Issue**: Product page was receiving entire product object as URL parameter instead of using the SKU to fetch from server.
- Showing full data: Exposing full product data in URL
- Poor UX: Extremely long, unreadable URLs
- Not scalable: URL length grows linearlly with product data size

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

**Why**: Clean URLs, can control what data is sent to user and define data rules, leverages existing API endpoint structure.

**Approach Choice**: I chose Next.js dynamic routing over query parameters because:
- The folder structure already had `[sku]` indicating this was the intended approach
- RESTful URL design is more SEO-friendly and user-friendly
- Eliminates security risk of exposing entire product data in URLs
- Scales better as product data grows in size

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

**Approach Choice**: I used query parameters over a separate API endpoint because:
- The existing API structure supported filtering via query params
- More efficient than creating `/api/subcategories/[category]/route.ts`
- Follows REST conventions for filtering resources
- Allows for future expansion with additional filter parameters

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

**Approach Choice**: I chose the empty string workaround over switching UI libraries because:
- Minimal code change with maximum impact
- Maintains consistency with existing Radix UI components
- Empty string is a semantic "no selection" value that Radix expects
- Avoids the complexity and risk of replacing the entire UI library


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

**Approach Choice**: I chose URL-based state management over localStorage because:
- URLs are shareable and bookmarkable (critical for e-commerce)
- Works with browser back/forward buttons out of the box
- Better for SEO - search engines can index filtered pages
- Stateless approach is more reliable than client-side storage
- Follows web standards and user expectations

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

**Approach Choice**: I chose traditional pagination over infinite scroll because:
- Better performance with large datasets (controlled memory usage)
- Users can jump directly to specific pages
- More predictable UX for desktop users
- Easier to implement with existing API structure that uses limit/offset
- Integrates cleanly with URL state management

## 6. Product Attribute Safety Checks

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

**Approach Choice**: I chose defensive programming over data validation because:
- Immediate fix that prevents crashes without touching the data layer
- Graceful degradation - products still display even with missing images
- Frontend should always handle incomplete data robustly
- Allows time to implement proper data validation separately
- Better user experience than hiding products entirely

**Note**: Products that are missing key attributes probably shouldn't be displayed to the user. Instead, maybe there should be some cleanup batch job that happens, or some stricter validation when adding product to database.

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

**Approach Choice**: I chose to allowlist the domain over using unoptimized images because:
- Maintains Next.js Image optimization benefits (WebP conversion, lazy loading, sizing)
- More secure than disabling domain restrictions entirely
- Amazon CDN is reliable and performant
- Follows Next.js best practices for external images
```

## 9. Missing Loading State on Product Pages

**Issue**: Product detail pages showed "Product not found" message while data was being fetched, causing user confusion.
- Users saw error message before API request completed
- No visual feedback during data loading
- Poor user experience with confusing state transitions

**Fix**: Added loading state management to prevent premature error display
```js
const [isLoading, setIsLoading] = useState(true);
```

**Why**: Provides clear user feedback and prevents confusion between loading and error states.

**Approach Choice**: I chose client-side loading state over converting to server components because:
- Minimal change to existing architecture
- Product pages need interactivity (image carousel) which requires client components anyway
- Faster perceived performance - page shell loads immediately
- Works well with existing API structure
- Easier to maintain consistency with the rest of the application

## Additional Improvements

### Code Organization
- **Extracted Pagination Component**: Moved pagination logic to `/components/ui/pagination.tsx` to reduce main page complexity and improve reusability

## Future Enhancements

### Testing
- **Unit Tests**: Implement Jest testing for components, especially filter logic and pagination
- **Component Documentation**: Add Storybook for visual component testing and design system documentation

### Client side cachine
- **client side caching** for better user exper
### Analytics & Monitoring
- **User Behavior Tracking**: Track filter usage, search queries, and product views
- **Performance Monitoring**: Add Core Web Vitals tracking for page load performance
- **Error Reporting**: Implement error logging service (e.g., Sentry) for production monitoring

### User Experience
- **Infinite Scroll**: Alternative to pagination for mobile users
- **Search Suggestions**: Autocomplete for search input with popular queries
- **Filter Persistence**: Remember user filter preferences across sessions 
- **client side caching**: Cache some product results for faster feeling website
