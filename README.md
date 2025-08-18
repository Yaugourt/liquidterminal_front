# Liquid Terminal

Liquid Terminal is a data processing platform and services dedicated to the HyperLiquid ecosystem. Our goal is to allow everyone to find everything they need through our services/products to navigate the HyperLiquid ecosystem.

## 🚀 Features

- **Real-time Market Data** - Live order books, price feeds, and trading data
- **Token Analytics** - Comprehensive token information and charts
- **Blockchain Explorer** - Transaction tracking and address monitoring
- **User Dashboard** - Personalized portfolio and trading history
- **Wiki Documentation** - Educational resources and guides
- **Authentication** - Secure user management with Privy

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: TradingView Lightweight Charts, Recharts
- **State Management**: Zustand
- **Authentication**: Privy
- **Data Fetching**: Axios with custom hooks
- **Real-time**: WebSocket connections
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── dashboard/           # User dashboard
│   ├── ecosystem/           # Liquid ecosystem features
│   ├── explorer/            # Blockchain explorer
│   ├── market/              # Market data & trading
│   ├── user/                # User profile & settings
│   └── wiki/                # Documentation
├── components/              # React components by domain
│   ├── ui/                  # Reusable UI components (shadcn)
│   ├── common/              # Shared components
│   ├── dashboard/           # Dashboard components
│   ├── ecosystem/           # Ecosystem components
│   ├── explorer/            # Explorer components
│   ├── market/              # Market components
│   ├── user/                # User components
│   └── wiki/                # Wiki components
├── services/                # API services by domain
│   ├── api/                 # Axios configuration
│   ├── auth/                # Authentication services
│   ├── common/              # Shared services
│   ├── dashboard/           # Dashboard services
│   ├── ecosystem/           # Ecosystem services
│   ├── explorer/            # Explorer services
│   ├── market/              # Market services
│   └── wiki/                # Wiki services
├── lib/                     # Utility libraries
│   ├── utils.ts             # General utilities
│   ├── dateFormatting.ts    # Date formatting
│   ├── numberFormatting.ts  # Number formatting
│   ├── tokenNameMapper.ts   # Token mapping
│   └── roleHelpers.ts       # Role management
├── hooks/                   # Custom React hooks
├── contexts/                # React contexts
├── store/                   # Global state (Zustand)
└── styles/                  # Custom CSS
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/liquidterminal_front.git
   cd liquidterminal_front
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # For local development (requires backend)
   NEXT_PUBLIC_API=http://localhost:3002
   
   # For production (deployed API)
   # NEXT_PUBLIC_API=https://liquidterminal.up.railway.app
   
   JWKS_URL=https://auth.privy.io/api/v1/apps/YOUR_PRIVY_APP_ID/jwks.json
   NEXT_PUBLIC_PRIVY_AUDIENCE=YOUR_PRIVY_APP_ID
   NEXT_PUBLIC_ENVIRONMENT=development
   ```
   
   **Note**: For local development, you'll need to run the backend API. See [LiquidTerminal Backend](https://github.com/Liquid-Terminal/LiquidTerminal_Back) for setup instructions.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- **TypeScript** - Strict type checking enabled
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Tailwind CSS** - Utility-first styling

## 🤝 Contributing

Coming soon.

## 📚 Documentation

- [API Implementation Guide](API_IMPLEMENTATION_GUIDE.md) - How to add new API service

## 🔗 Links

- **Website**: [liquidterminal.com](https://liquidterminal.com)
- **X**: [@LiquidTerminal](https://x.com/liquidterminal)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.