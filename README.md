# Dream Properties SaaS

A modern, multi-tenant real estate platform for Nashik, connecting buyers with verified premium property developments.

## Features

- 🏠 **Multi-Tenant Architecture** - Support for builders, buyers, and administrators
- 📱 **Mobile-First Design** - Responsive UI optimized for all devices
- 🎨 **Modern UI/UX** - Professional design with smooth animations and transitions
- 🔍 **Advanced Search** - Quick booking form with property type filtering
- 📊 **Dashboard System** - Role-based dashboards for different user types
- ✨ **AI Integration Ready** - Gemini API integration for enhanced features

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Build Tool:** Vite

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sapatil2212/Dream-Properties.git
   cd Dream-Properties
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
├── components/          # Reusable UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── QuickBanner.tsx
│   └── UIComponents.tsx
├── pages/              # Page components
│   ├── Home/           # Home page sections
│   ├── Properties.tsx
│   ├── About.tsx
│   └── DashboardPages.tsx
├── App.tsx             # Main application component
├── types.ts            # TypeScript type definitions
└── constants.tsx       # Application constants
```

## Key Features

### For Buyers
- Browse properties with advanced filtering
- Save favorite properties
- Contact builders directly
- Schedule site visits

### For Builders
- Post properties for FREE
- Manage property listings
- Track leads and inquiries
- Analytics dashboard

### For Administrators
- User management
- Builder verification
- Platform analytics
- Finance tracking

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contact

**Dream Properties**
- 📞 Call/WhatsApp: +91 98811 59245
- 📧 Email: dreampropertiesnsk@gmail.com
- 📍 Office: No 957, 9th floor, Roongtha Future-X, RD circle, Nashik 422 009

## License

All rights reserved © 2026 Dream Properties
