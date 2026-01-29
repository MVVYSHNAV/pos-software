# Tridz POS – Product Requirements Document (PRD)

## 1. Project Overview

### 1.1 Project Information
- **Project Name**: Tridz POS
- **Type**: Web-based Point of Sale (POS) System
- **Target Users**: Retail store cashiers, shop owners, restaurant staff
- **Platform**: Web (Desktop & Tablet optimized)

### 1.2 Technology Stack

| Layer | Technology |
|-------|------------|
| Build Tool | Vite |
| Framework | React 18+ (TypeScript) |
| Styling | TailwindCSS v4 |
| UI Components | shadcn/ui |
| State Management | Zustand |
| API Integration | Frappe JS SDK |
| Backend | Frappe/ERPNext |

### 1.3 Purpose
Build a fast, modern, touch-friendly POS interface that integrates seamlessly with Frappe/ERPNext backend for real-time inventory management, order processing, and sales tracking.

---

## 2. Business Objectives

### 2.1 Primary Goals
1. **Speed**: Enable cashiers to process transactions in under 30 seconds
2. **Accuracy**: Reduce order errors through intuitive UI/UX
3. **Efficiency**: Support multiple concurrent orders
4. **Reliability**: Work seamlessly with real-time inventory sync
5. **Scalability**: Handle 100+ products across multiple categories

### 2.2 Success Metrics
- Average transaction time < 30 seconds
- Order error rate < 1%
- System uptime > 99.5%
- User satisfaction score > 4.5/5
- Page load time < 2 seconds

---

## 3. User Personas

### 3.1 Primary User: Cashier
- **Age**: 20-45
- **Tech Proficiency**: Basic to Intermediate
- **Goals**: Process orders quickly, minimize errors, handle multiple customers
- **Pain Points**: Slow systems, complex interfaces, inventory confusion

### 3.2 Secondary User: Store Manager
- **Age**: 30-55
- **Tech Proficiency**: Intermediate to Advanced
- **Goals**: Monitor sales, manage inventory, track performance
- **Pain Points**: Lack of real-time data, manual reconciliation

---

## 4. Core Features & Requirements

### 4.1 Product Browsing

#### 4.1.1 Category Navigation
- **Requirement**: Horizontal tab navigation for product categories
- **Categories**: 
  - All Items (default)
  - Beverages
  - Snacks
  - Groceries
  - Personal Care
  - Stationery
  - Electronics
  - Household
- **Behavior**: 
  - Active category highlighted with brand color (#2F5D50)
  - Click to filter products instantly
  - "All Items" shows complete inventory

#### 4.1.2 Product Grid
- **Layout**: Responsive grid (2-5 columns based on screen size)
- **Card Components**:
  - Product image (placeholder if unavailable)
  - Product name (truncated with ellipsis)
  - Product code (e.g., BEV-001)
  - Price (₹ format)
  - Stock indicator (color-coded: green text)
  - Add button (circular, brand teal color)

#### 4.1.3 Search Functionality
- **Input**: Search bar in header
- **Search By**: Item name OR item code
- **Behavior**: Real-time filtering as user types
- **UX**: Clear button to reset search

#### 4.1.4 Stock Display
- **Format**: "Stock: {quantity}"
- **Color Coding**:
  - Green (#2E7D32): Stock > 50
  - Orange: Stock 10-50
  - Red: Stock < 10
  - Gray: Out of stock

---

### 4.2 Cart Management

#### 4.2.1 Multi-Order Support
- **Requirement**: Support multiple concurrent orders
- **UI Elements**:
  - Order tabs: "Order #1", "Order #2", etc.
  - "+ New Order" button
  - Active order highlighted
- **Behavior**:
  - Switch between orders without losing data
  - Each order maintains independent cart state

#### 4.2.2 Cart Panel
- **Location**: Right sidebar (fixed, 380px width on desktop)
- **Header**: "Current Order" + item count
- **Empty State**: "Cart is empty / Add items to get started"

#### 4.2.3 Cart Item Display
Each cart item shows:
- Product image (thumbnail)
- Product name
- Unit price
- Quantity controls:
  - Decrement button (-)
  - Quantity display
  - Increment button (+)
- Line total (price × quantity)
- Remove button (trash icon)

#### 4.2.4 Quantity Management
- **Min Quantity**: 1
- **Max Quantity**: Available stock
- **Validation**: 
  - Prevent adding more than available stock
  - Show toast notification on stock limit
- **Behavior**:
  - Increment/decrement by 1
  - Auto-update line total and grand total

#### 4.2.5 Cart Summary
Display in order:
1. **Subtotal**: Sum of all line totals
2. **Tax (18%)**: Calculated on subtotal
3. **Grand Total**: Subtotal + Tax

**Format**: Right-aligned, bold for Grand Total

#### 4.2.6 Checkout Button
- **Style**: Full-width, soft sage color (#A9B8B2)
- **Text**: "Checkout"
- **State**: 
  - Disabled when cart is empty
  - Enabled when cart has items
- **Action**: Proceed to payment/confirmation

---

### 4.3 System Status & Navigation

#### 4.3.1 Online/Offline Indicator
- **Location**: Top-right header
- **Display**: 
  - Green dot + "Online" (when connected)
  - Red dot + "Offline" (when disconnected)
- **Behavior**: Auto-detect network status

#### 4.3.2 User Profile
- **Icon**: User avatar/icon
- **Action**: Dropdown menu with:
  - User name
  - Logout option
  - Profile settings

#### 4.3.3 Settings Access
- **Icon**: Gear/settings icon
- **Action**: Open settings panel/modal

---

## 5. State Management Architecture

### 5.1 useCartStore (Zustand)

```typescript
interface CartStore {
  // State
  currentOrderId: string;
  orders: Order[];
  
  // Actions
  createOrder: () => void;
  switchOrder: (orderId: string) => void;
  addItem: (item: Product) => void;
  removeItem: (orderId: string, itemId: string) => void;
  updateQuantity: (orderId: string, itemId: string, quantity: number) => void;
  clearOrder: (orderId: string) => void;
  
  // Computed
  calculateSubtotal: (orderId: string) => number;
  calculateTax: (orderId: string) => number;
  calculateTotal: (orderId: string) => number;
}
```

### 5.2 useProductStore (Zustand)

```typescript
interface ProductStore {
  // State
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  searchTerm: string;
  isLoading: boolean;
  
  // Actions
  fetchProducts: () => Promise<void>;
  setCategory: (category: string) => void;
  setSearchTerm: (term: string) => void;
  
  // Computed
  filteredProducts: () => Product[];
}
```

---

## 6. API Integration

### 6.1 Frappe JS SDK Setup
- **Authentication**: Session-based auth with Frappe
- **Base URL**: Configured via environment variables
- **Error Handling**: Toast notifications for API errors

### 6.2 Key API Endpoints

#### 6.2.1 Products
```
GET /api/resource/Item
- Fetch all items with filters
- Fields: name, item_code, item_name, standard_rate, image, item_group, stock_qty
```

#### 6.2.2 Stock Check
```
GET /api/resource/Bin
- Real-time stock availability
- Fields: item_code, actual_qty, warehouse
```

#### 6.2.3 Create Order
```
POST /api/resource/POS Invoice
- Submit order for processing
- Payload: items[], customer, taxes, totals
```

### 6.3 Real-time Sync
- **Stock Updates**: Poll every 30 seconds or use WebSocket
- **Price Updates**: Fetch on category change
- **Offline Mode**: Queue orders locally, sync when online

---

## 7. Design System

### 7.1 Brand Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Deep Teal (Primary) | `#2F5D50` | Primary buttons, active states, add icons |
| Teal Hover | `#3F6F61` | Hover states |
| Soft Sage | `#A9B8B2` | Checkout button, muted elements |
| Online Green | `#2ECC71` | Online status indicator |
| Stock Green | `#2E7D32` | Stock text |
| Main Background | `#F8FAF9` | App background |
| Card Background | `#FFFFFF` | Product cards |
| Light Border | `#E5E7EB` | Dividers, borders |
| Muted Text | `#6B7280` | Secondary text |
| Primary Text | `#1F2937` | Main text |
| Price Green | `#2F6F5E` | Price display |

### 7.2 Typography
- **Font Family**: System UI stack (system-ui, Avenir, Helvetica, Arial)
- **Headings**: Bold, 1.5-2rem
- **Body**: Regular, 1rem
- **Small Text**: 0.875rem (stock, codes)

### 7.3 Spacing
- **Grid Gap**: 1rem (16px)
- **Card Padding**: 1rem
- **Section Padding**: 1.5rem
- **Border Radius**: 0.5rem (8px)

### 7.4 Responsive Breakpoints
- **Mobile**: < 640px (1-2 columns)
- **Tablet**: 640px - 1024px (2-3 columns)
- **Desktop**: > 1024px (3-5 columns)

---

## 8. User Flows

### 8.1 Standard Purchase Flow
1. Cashier opens POS interface
2. Selects category or searches for product
3. Clicks "+" button to add item to cart
4. Adjusts quantity if needed
5. Reviews cart summary
6. Clicks "Checkout"
7. Processes payment (external flow)
8. Confirms order
9. Prints receipt

### 8.2 Multi-Order Flow
1. Cashier starts Order #1
2. Customer A requests to hold order
3. Cashier clicks "+ New Order"
4. Processes Order #2 for Customer B
5. Completes Order #2
6. Switches back to Order #1
7. Completes Order #1

---

## 9. Non-Functional Requirements

### 9.1 Performance
- **Initial Load**: < 2 seconds
- **Category Switch**: < 200ms
- **Add to Cart**: < 100ms
- **Search Response**: < 150ms

### 9.2 Accessibility
- **Keyboard Navigation**: Full support
- **Screen Readers**: ARIA labels on all interactive elements
- **Color Contrast**: WCAG AA compliance
- **Touch Targets**: Minimum 44x44px

### 9.3 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 9.4 Security
- HTTPS only
- Session timeout after 30 minutes of inactivity
- Role-based access control via Frappe
- No sensitive data in localStorage

---

## 10. Future Enhancements

### 10.1 Phase 2 Features
- [ ] Barcode scanner integration
- [ ] Customer management (loyalty, discounts)
- [ ] Payment gateway integration
- [ ] Receipt printing
- [ ] Offline mode with sync queue
- [ ] Analytics dashboard

### 10.2 Phase 3 Features
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Custom discounts/promotions
- [ ] Split payment methods
- [ ] Returns/refunds handling
- [ ] Shift management

---

## 11. Testing Requirements

### 11.1 Unit Tests
- Component rendering
- State management logic
- Calculation functions (subtotal, tax, total)
- API integration mocks

### 11.2 Integration Tests
- Add to cart flow
- Checkout flow
- Multi-order management
- Search and filter

### 11.3 E2E Tests
- Complete purchase flow
- Multi-order scenario
- Network failure handling
- Stock validation

---

## 12. Deployment

### 12.1 Build Process
```bash
yarn build
# Outputs to ../tridz_pos/public/pos/dist/
```

### 12.2 Environment Variables
```env
VITE_API_URL=https://your-frappe-instance.com
VITE_APP_NAME=Tridz POS
```

### 12.3 Hosting
- Served via Frappe backend
- Static assets cached with CDN
- Gzip compression enabled

---

## 13. Maintenance & Support

### 13.1 Monitoring
- Error tracking (Sentry or similar)
- Performance monitoring (Web Vitals)
- User analytics (optional)

### 13.2 Documentation
- Component documentation (Storybook)
- API documentation
- User manual
- Developer setup guide

---

## 14. Appendix

### 14.1 Glossary
- **POS**: Point of Sale
- **SKU**: Stock Keeping Unit
- **ERPNext**: Open-source ERP system
- **Frappe**: Framework powering ERPNext

### 14.2 References
- [Frappe JS SDK Documentation](https://github.com/frappe/frappe-js-sdk)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TailwindCSS v4](https://tailwindcss.com/)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-29  
**Author**: Tridz Development Team  
**Status**: Active Development
