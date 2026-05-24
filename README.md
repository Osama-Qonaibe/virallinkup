# ViralLinkUp - Digital Products Marketplace

> منصة احترافية لبيع المنتجات الرقمية مع دعم كامل للغتين العربية والإنجليزية

A professional digital products marketplace with full Arabic/English bilingual support, real-time notifications, email system, referral program, and comprehensive admin dashboard.

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **Prisma ORM** | Database management |
| **SQLite** | Lightweight database |
| **Zustand** | Client-side state management |
| **JWT** | Authentication with httpOnly cookies |
| **bcryptjs** | Password hashing |
| **Stripe** | Payment processing |
| **Nodemailer** | Email service (SMTP) |
| **Framer Motion** | Animations |

## 📁 Project Structure

```
virallinkup/
├── prisma/
│   └── schema.prisma          # 13 database models
├── public/
│   ├── logo.jpg / logo.svg    # Brand assets
│   └── slider1-6.png          # Hero slider images
├── src/
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── jwt.ts             # JWT sign/verify/cookie helpers
│   │   ├── store.ts           # Zustand store with persist
│   │   ├── translations.ts    # AR/EN translations (~710 keys)
│   │   ├── constants.ts       # TypeScript interfaces & constants
│   │   ├── utils.ts           # cn() helper
│   │   ├── email.ts           # Email service with professional templates
│   │   └── notifications.ts   # Notification system with email integration
│   ├── components/
│   │   ├── SiteHeader.tsx     # Sticky header with nav + notification bell
│   │   ├── SiteFooter.tsx     # Footer with newsletter + legal links
│   │   ├── HeroSlider.tsx     # Hero carousel (6 slides)
│   │   ├── FeaturesSection.tsx
│   │   ├── PackagesPreview.tsx
│   │   ├── PackagesList.tsx
│   │   ├── PackageDetail.tsx
│   │   ├── CategoriesPage.tsx
│   │   ├── SubscriptionsPage.tsx
│   │   ├── FAQSection.tsx / FAQPage.tsx
│   │   ├── CTASection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── TechBackground.tsx
│   │   ├── ScrollToTop.tsx
│   │   ├── LegalPageView.tsx
│   │   ├── AuthInitializer.tsx
│   │   ├── LoginCard.tsx / RegisterCard.tsx / ForgotPasswordCard.tsx
│   │   ├── NotificationBell.tsx       # Real-time notification bell
│   │   ├── AdminLayout.tsx           # Admin sidebar navigation
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminProducts.tsx
│   │   ├── AdminOrders.tsx
│   │   ├── AdminUsers.tsx
│   │   ├── AdminCategories.tsx
│   │   ├── AdminTestimonials.tsx
│   │   ├── AdminPages.tsx
│   │   ├── AdminSettings.tsx
│   │   ├── AdminEmailTemplates.tsx    # Email template management
│   │   ├── UserDashboard.tsx
│   │   ├── UserPurchases.tsx
│   │   ├── UserDownloads.tsx
│   │   ├── UserReferrals.tsx
│   │   ├── UserWallet.tsx
│   │   └── ui/               # shadcn/ui components
│   ├── app/
│   │   ├── layout.tsx        # Root layout (RTL/LTR, fonts, Toaster)
│   │   ├── page.tsx          # SPA router (24+ pages)
│   │   ├── globals.css       # Tailwind + custom styles
│   │   └── api/
│   │       ├── auth/         # login, register, logout, me, google, forgot-password
│   │       ├── admin/        # products, users, orders, stats, categories, pages, settings, email-templates, email-settings, email-test
│   │       ├── notifications/ # list, unread, mark-read, mark-all-read
│   │       ├── orders/       # create + list
│   │       ├── payments/     # create-checkout, verify, webhook, history, cancel-subscription, test-connection
│   │       ├── products/     # list + detail
│   │       ├── categories/   # list + create
│   │       ├── referrals/    # list user referrals
│   │       ├── settings/     # get + update
│   │       ├── testimonials/ # list + create
│   │       ├── user/         # dashboard stats
│   │       └── wallet/       # withdraw
│   └── hooks/
│       └── use-toast.ts
├── .env.example               # Environment template
├── .gitignore
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── seed.ts                    # Database seeder with 9 email templates
```

## 🗄️ Database Models (13)

| Model | Description |
|---|---|
| **User** | Users with roles (USER/ADMIN), wallet, subscriptions, referral codes |
| **Product** | Digital products with bilingual titles, prices, license types |
| **Order** | Purchase records with status tracking |
| **Referral** | Referral tracking with commission management |
| **WalletTransaction** | Credit/debit transactions for user wallets |
| **SiteSetting** | Key-value configuration store |
| **Page** | Legal pages (Privacy, Terms, About) with bilingual content |
| **Testimonial** | Customer reviews with ratings |
| **ContactMessage** | Contact form submissions |
| **Category** | Product categories with icons and sort order |
| **PaymentIntent** | Stripe payment tracking with metadata |
| **Notification** | User notifications with types and read status |
| **EmailTemplate** | Configurable email templates with bilingual HTML |

## 🎨 Design System

### Brand Colors
- **Primary Gradient**: `#B01743 → #F61A5A → #FF6B8A`
- **Secondary**: `#B4CDD3` (Cyan accent)
- **Dark Background**: `#0F0F1A`
- **Card Background**: `#1A1A2E`
- **Text Primary**: `#E8E8F0`
- **Text Muted**: `#8888A0`

### UI Features
- Glassmorphism cards (`glass-card` class)
- Gradient text (`gradient-text` class)
- Glow effects (`glow-rose`, `glow-cyan`)
- Animated gradient borders
- Technology particle background
- Framer Motion animations (slide, fade, float)
- Custom scrollbar styling

### RTL/LTR Support
- Arabic-first (default RTL)
- Language toggle (AR ↔ EN)
- Cairo font for Arabic
- Geist font for English
- Early script prevents RTL flash on page load
- `dir="rtl"` / `dir="ltr"` on HTML element

## 📧 Email System

### Architecture
- **SMTP Transport**: Nodemailer with configurable SMTP (Gmail, custom servers)
- **Professional Templates**: Dark theme matching the platform identity
- **Bilingual**: Separate Arabic and English HTML templates
- **Dynamic Variables**: `{{name}}`, `{{email}}`, `{{amount}}`, `{{productName}}`, `{{plan}}`, `{{commission}}`, `{{referredName}}`

### Default Templates (9)
1. **welcome** - New user welcome email
2. **purchase_confirmation** - Product purchase receipt
3. **payment_confirmation** - Generic payment confirmation
4. **wallet_deposit** - Wallet credit notification
5. **wallet_withdrawal** - Withdrawal request confirmation
6. **referral_commission** - New referral earned commission
7. **subscription_activated** - Subscription plan activated
8. **subscription_cancelled** - Subscription cancelled
9. **password_reset** - Password recovery request

### Configuration
All email settings are configurable from the admin panel:
- SMTP Host, Port, Secure (TLS/SSL)
- SMTP Username, Password
- From Name, From Email
- Test email sending before going live

## 🔔 Notification System

### Real-Time Bell Icon
- Badge counter for unread notifications
- Auto-refresh every 30 seconds
- Dropdown panel with notification list
- "Mark all as read" action
- Individual mark-as-read per notification

### Notification Types
| Type | Trigger | Icon |
|---|---|---|
| **WELCOME** | User registration | Info |
| **PURCHASE** | Product purchased | ShoppingBag |
| **PAYMENT** | Payment completed | CreditCard |
| **WALLET_DEPOSIT** | Wallet credited | CreditCard |
| **WALLET_WITHDRAW** | Withdrawal requested | CreditCard |
| **REFERRAL** | New referral joined | Users |
| **SUBSCRIPTION** | Plan activated | Star |
| **SUBSCRIPTION_CANCEL** | Plan cancelled | Star |
| **DOWNLOAD** | Product downloaded | Download |
| **PASSWORD_RESET** | Password reset requested | AlertCircle |

## 👨‍💼 Admin Dashboard

### Navigation Sections
1. **Overview** - Revenue, users, orders, products stats with charts
2. **Products** - CRUD for digital products with features, images, license types
3. **Orders** - View all orders with product/user details
4. **Users** - Manage users, roles, wallet balances
5. **Categories** - Organize product categories
6. **Testimonials** - Manage customer reviews
7. **Pages** - Edit legal pages (Privacy, Terms, About)
8. **Email & Templates** - SMTP settings, email templates CRUD, test emails
9. **Settings** - Brand identity (logo, colors), payment gateway (Stripe)

## 🔗 Referral System
- Unique referral code per user
- Shareable referral link
- Commission tracking (PENDING → COMPLETED)
- Wallet integration (commissions credited to wallet)
- Referral statistics dashboard

## 💳 Payment System
- **Demo Mode**: Simulated payments when Stripe is not configured
- **Live Mode**: Full Stripe integration with webhook handling
- **Payment Types**: Product purchase, wallet deposit, subscription
- **Stripe Webhook Events**: checkout.session.completed, invoice.payment_succeeded, invoice.payment_failed, customer.subscription.deleted
- **Test Connection**: Verify Stripe API key from admin panel
- **Multi-currency**: USD, EUR, SAR, AED

## 🔐 Authentication
- JWT tokens with 30-day expiry
- httpOnly secure cookies
- Email + Password login (bcrypt hashed)
- Google OAuth simulation
- Session persistence across page refreshes
- Zustand persist for user preferences
- Password reset with email notification

## 🌐 License Types
| Type | Arabic | Use Case |
|---|---|---|
| PERSONAL | شخصي | Personal projects |
| COMMERCIAL | تجاري | Commercial use |
| EXTENDED | ممتد | Extended commercial |
| RESELLER | إعادة البيع | Resell the product |
| ENTERPRISE | مؤسسي | Enterprise/Team |
| PLR | حقوق تأليف خاصة | Private Label Rights |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/Osama-Qonaibe/virallinkup.git
cd virallinkup
npm install
cp .env.example .env
npx prisma db push
npx prisma generate
npx tsx seed.ts
npm run dev
```

### Environment Variables
See `.env.example` for all available variables.

### Production Build
```bash
npm run build
npm start
```

## 📊 API Routes (30+)

### Auth
- `POST /api/auth/login` - Email login
- `POST /api/auth/register` - Create account
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Get current user
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/forgot-password` - Password reset

### Notifications
- `GET /api/notifications` - List user notifications (paginated)
- `GET /api/notifications/unread` - Get unread count
- `POST /api/notifications/mark-read` - Mark single as read
- `POST /api/notifications/mark-all-read` - Mark all as read

### Admin
- `GET/POST /api/admin/products` - List/Create products
- `DELETE /api/admin/products/[id]` - Delete product
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/[id]` - Update user
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/stats` - Dashboard statistics
- `GET/POST /api/admin/email-templates` - List/Create email templates
- `PUT/DELETE /api/admin/email-templates/[id]` - Update/Delete template
- `GET/PUT /api/admin/email-settings` - Get/Set SMTP settings
- `POST /api/admin/email-test` - Send test email

### Payments
- `POST /api/payments/create-checkout` - Create Stripe checkout
- `POST /api/payments/verify` - Verify demo payment
- `POST /api/payments/webhook` - Stripe webhook
- `GET /api/payments/history` - User payment history
- `POST /api/payments/cancel-subscription` - Cancel subscription
- `POST /api/payments/test-connection` - Test Stripe key

### Public
- `GET /api/products` - List products (filter, search, paginate)
- `GET /api/products/[id]` - Product detail
- `GET/POST /api/categories` - List/Create categories
- `GET/PUT /api/settings` - Site settings
- `GET /api/pages/[slug]` - Legal page content
- `GET /api/testimonials` - Customer testimonials
- `GET /api/referrals` - User referral data

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ by ViralLinkUp Team
