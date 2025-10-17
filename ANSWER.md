1. Fix getting individual product

before parsing entire object and not using product id and search param of nextjs feature. (sku)
This forced us to pass entire object in param. Possibly open attack vectors since json got parsed

Starter code had [sku] already so probably waht they wanted. However, different ways to do this, (maybe unqiue name url to make it more readable like what kohls and amazon does)

fixed by using nextjs dynamic routing, and just using product sku to render. This makes url much more readable and if object is really large will not scale constant in respect to object size

after 
```js
  const params = useParams();
  const sku = String(params.sku);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (sku) {
      fetch(`/api/products/${sku}`)
        .then((res) => res.json())
        .then((data) => setProduct(data))
        .catch((error) => console.error('Failed to fetch product data:', error));
    }
  }, [sku]);

  ...
    <Link
        key={product.stacklineSku}
        href={`/product/${product.stacklineSku}`}
    >
```

2. categoriy fix

app not correctly querying sub-category api endpooint, missing the category

fix was to add the categroy tot he sub-cateorgy endpint

before
```js
fetch(`/api/subcategories`)
```

after
```js
fetch(`/api/subcategories/${selectedCategory}`)
```

3. missig url parameters

right now, when a user applies a category or subcaterogy its not reflected in the url. ALso limit and offset not in url. This casues bookmark issues and also some SEO problems and harder to track metrics (something stackline needs)

fix: add params and logic for rednding and prefilling filters + paginaition data on params

4. missing pagination controls

no way for user to load next window of data, they get stuck witht he first window. Not good since users cant see everything

fix: add a paginiation controls

5. safety checks, no image
 
intiall check was product.imageUrls[0] exists, hwover, if the array doesn't exist
then it will raise an error. Instead i think the implied bejavior is to igrnore produts who dont have an image. thus fix is to change boolean expression to

```js
product.imageUrls && product.imageUrls[0] && 
```

for listing page

and 

```js
product.imageUrls && product.imageUrls[selectedImage]

...

product.imageUrls && product.imageUrls.length > 1 

...

product.featureBullets && product.featureBullets.length > 0

```

in indivual product 


note that this should have prpbably never have been displayed. Maybe instead the frontend should send a message or log the products that don't have improtant keys

6. other 

while fixing pagianition, I was getting this error
ntime Error

Invalid src prop (https://images-na.ssl-images-amazon.com/images/I/81ZSuzkKKHL._AC_SL1500_.jpg) on next/image, hostname "images-na.ssl-images-amazon.com" is not configured under images in your next.config.js
See more info: https://nextjs.org/docs/messages/next-image-unconfigured-host

Call Stack
18

this was because enxtjs was blocking exertnal image hostname of 'images-na.ssl-images-amazon.com',
thus i added it to the next.config.ts