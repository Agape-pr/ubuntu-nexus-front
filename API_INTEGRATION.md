# API Integration Guide

This guide explains how to connect your backend API to the Ubuntu Nexus Front application.

**Updated to match Swagger API documentation** (`/api/v1/` endpoints)

## 📋 Table of Contents

1. [Setup](#setup)
2. [Configuration](#configuration)
3. [API Structure](#api-structure)
4. [Usage Examples](#usage-examples)
5. [Authentication Flow](#authentication-flow)
6. [CORS Configuration](#cors-configuration)
7. [Environment Variables](#environment-variables)

## 🚀 Setup

### Step 1: Create Environment File

Copy the example environment file and configure your API URL:

```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**Important:** 
- Replace `http://localhost:8000/api/v1` with your actual backend API URL
- The URL should include `/api/v1` as the API uses versioned endpoints

### Step 2: Install Dependencies

All required dependencies are already installed. The project uses:
- `@tanstack/react-query` for data fetching
- Native `fetch` API (no axios needed)

## ⚙️ Configuration

### API Base URL

The API base URL is configured in `src/lib/api/config.ts`:

```typescript
const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
export const API_BASE_URL = BASE_API_URL.endsWith('/v1') ? BASE_API_URL : `${BASE_API_URL}/v1`;
```

**Note:** The API uses `/api/v1/` prefix for all endpoints.

### API Endpoints

All API endpoints are defined in `src/lib/api/config.ts` under `API_ENDPOINTS`. You can modify these to match your backend routes.

## 📁 API Structure

The API integration is organized as follows:

```
src/lib/api/
├── config.ts          # API configuration and endpoints
├── client.ts          # HTTP client with auth handling
├── services/          # API service functions
│   ├── auth.ts        # Authentication endpoints
│   └── products.ts    # Product endpoints
└── hooks/             # React Query hooks
    ├── useAuth.ts     # Auth hooks (useLogin, useRegister, etc.)
    └── useProducts.ts # Product hooks (useProducts, useProduct, etc.)
```

## 💡 Usage Examples

### Authentication

The Auth page (`src/pages/Auth.tsx`) is already integrated with the API:

```typescript
import { useLogin, useRegister, useSendOTP, useVerifyOTP } from "@/lib/api/hooks/useAuth";

const loginMutation = useLogin();
const registerMutation = useRegister();
const sendOTPMutation = useSendOTP();
const verifyOTPMutation = useVerifyOTP();

// Login (uses username which can be email)
loginMutation.mutate({
  username: "user@example.com", // Can be email or username
  password: "password123"
});

// Register
registerMutation.mutate({
  email: "user@example.com",
  password: "password123",
  account_type: "buyer", // or "seller"
  phone_number: "+250 7XX XXX XXX", // optional
  store: { // Only for sellers
    store_name: "My Store",
    store_description: "Store description",
    store_logo: "logo_url" // optional
  }
});

// OTP Flow (for registration verification)
sendOTPMutation.mutate({
  email: "user@example.com",
  purpose: "register"
});

verifyOTPMutation.mutate({
  email: "user@example.com",
  purpose: "register",
  otp: "123456"
});
```

### Fetching Products

```typescript
import { useProducts } from "@/lib/api/hooks/useProducts";

function ProductList() {
  const { data, isLoading, error } = useProducts({
    category__slug: "fashion", // Filter by category slug
    search: "bag", // Search term
    price__gte: 1000, // Minimum price
    price__lte: 50000, // Maximum price
    ordering: "-created_at", // Sort by newest first
    store__id: 1 // Filter by store ID
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>Price: {product.price}</p>
          <p>Store: {product.store_name}</p>
        </div>
      ))}
    </div>
  );
}
```

### Fetching Single Product (by slug)

```typescript
import { useProduct } from "@/lib/api/hooks/useProducts";

function ProductDetail({ slug }: { slug: string }) {
  const { data, isLoading, error } = useProduct(slug);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data?.name}</h1>
      <p>{data?.description}</p>
      <p>Price: {data?.price}</p>
      <p>Stock: {data?.stock_quantity}</p>
    </div>
  );
}
```

### Creating Products (Seller)

```typescript
import { useCreateProduct } from "@/lib/api/hooks/useProducts";

function CreateProductForm() {
  const createProduct = useCreateProduct();

  const handleSubmit = (data) => {
    createProduct.mutate({
      category: 1, // Category ID (number)
      name: "Product Name",
      description: "Product description",
      price: "10000", // Price as string
      stock_quantity: 50,
      is_active: true,
      uploaded_images: ["image_url_1", "image_url_2"] // Array of image URLs
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### Fetching Categories

```typescript
import { useCategories } from "@/lib/api/hooks/useCategories";

function CategoryList() {
  const { data, isLoading, error } = useCategories();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map(category => (
        <div key={category.id}>
          <h3>{category.name}</h3>
          <p>Slug: {category.slug}</p>
        </div>
      ))}
    </div>
  );
}
```

### Direct API Calls

You can also use the API client directly:

```typescript
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

// GET request (returns data directly, not wrapped)
const products = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST);
console.log(products); // Array of products

// POST request
const newProduct = await apiClient.post(API_ENDPOINTS.SELLER_PRODUCTS.CREATE, {
  category: 1,
  name: "Product Name",
  price: "10000",
  stock_quantity: 50
});
```

## 🔒 Authentication

The API client automatically handles authentication tokens:

- **Token Storage**: Access token stored in `localStorage` as `access_token`, refresh token as `refresh_token`
- **Automatic Headers**: The `Authorization: Bearer <access_token>` header is automatically added to all requests
- **Token Management**: Use `apiClient.setTokens(access, refresh)` and `apiClient.removeTokens()` to manage tokens

### Expected Backend Response Format

#### Login Response

```json
{
  "access": "jwt_access_token_here",
  "refresh": "jwt_refresh_token_here"
}
```

#### Register Response

```json
{
  "email": "user@example.com",
  "phone_number": "+250 7XX XXX XXX",
  "store": {
    "store_name": "My Store",
    "store_description": "Store description",
    "store_logo": "logo_url"
  }
}
```

#### Token Refresh Response

```json
{
  "access": "new_jwt_access_token_here"
}
```

#### Error Response

```json
{
  "message": "Error message",
  "errors": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

## 🌐 CORS Configuration

### Option 1: Backend CORS Configuration (Recommended)

Configure your backend to allow requests from your frontend:

```javascript
// Example for Express.js
app.use(cors({
  origin: 'http://localhost:8080', // Your frontend URL
  credentials: true
}));
```

### Option 2: Vite Proxy (Development Only)

If you need a proxy for development, uncomment the proxy configuration in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

Then update your `.env` to use relative URLs:

```env
VITE_API_BASE_URL=/api
```

## 📝 Environment Variables

### Development

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Production

```env
VITE_API_BASE_URL=https://api.yourapp.com/api/v1
```

**Note:** 
- Environment variables must be prefixed with `VITE_` to be accessible in Vite applications
- The URL should include `/api/v1` as the API uses versioned endpoints

## 🔧 Backend API Requirements

Your backend API should:

1. **Return JSON responses directly** (not wrapped in `{data, success}`):
   ```json
   [
     { "id": 1, "name": "Product 1" },
     { "id": 2, "name": "Product 2" }
   ]
   ```
   or
   ```json
   {
     "id": 1,
     "name": "Product 1",
     "price": "10000"
   }
   ```

2. **Handle errors** with appropriate HTTP status codes:
   - `400` - Bad Request
   - `401` - Unauthorized
   - `403` - Forbidden
   - `404` - Not Found
   - `500` - Internal Server Error

3. **Support CORS** if frontend and backend are on different domains

4. **Use JWT tokens** for authentication:
   - Access token in `Authorization: Bearer <token>` header
   - Refresh token stored separately for token refresh

5. **API Endpoints** should follow `/api/v1/` prefix structure

## 📚 Additional Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## 🐛 Troubleshooting

### API calls not working

1. Check that your `.env` file exists and has `VITE_API_BASE_URL` set
2. Verify your backend is running and accessible
3. Check browser console for CORS errors
4. Verify the API endpoint URLs match your backend routes

### Authentication not working

1. Check that tokens are being stored: 
   - `localStorage.getItem('access_token')`
   - `localStorage.getItem('refresh_token')`
2. Verify your backend returns tokens in the expected format (`{access, refresh}`)
3. Check that the Authorization header is being sent (check Network tab)
4. Ensure login uses `username` field (can be email)

### CORS errors

1. Configure CORS on your backend
2. Or use Vite proxy for development (see CORS Configuration section)
