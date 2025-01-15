# SlotThing - Modern Slot Game Platform

![SlotThing Banner](public/banner.png)

A modern, responsive slot game platform built with Next.js 14, featuring real-time gameplay, user dashboard, and seamless mobile experience.

## Features

- Multiple slot game variations
- Responsive design with mobile-first approach
- Real-time game statistics
- Virtual currency and diamond system
- Secure user authentication
- Personal dashboard with game history
- Beautiful UI with backdrop blur effects
- Modern design with smooth animations

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js
- **State Management:** React Context
- **Icons:** React Icons
- **Animations:** Tailwind CSS transitions
- **Font:** Montserrat & Playfair Display

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.17 or later
- npm or yarn package manager
- Git for version control

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/cogniasys/slotthing.git
   cd slotthing
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   DATABASE_URL=your-database-url
   ```

## Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Mobile-First Approach

The platform features a responsive design that works seamlessly across all devices:

- **Desktop:** Full sidebar navigation with expanded features
- **Tablet:** Adaptive layout with collapsible sidebar
- **Mobile:** Bottom navigation bar with quick access to essential features

## Game Features

- Multiple slot game variations
- Real-time win calculations
- Virtual currency system
- Achievement tracking
- Leaderboard integration
- Social sharing capabilities

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=your-database-url

# API Keys (if needed)
EXTERNAL_API_KEY=your-api-key
```

## Project Structure

```
slot/
├── app/                    # Next.js app directory
│   ├── components/         # Reusable components
│   ├── dashboard/         # Dashboard pages
│   ├── games/            # Game components
│   └── layout.tsx        # Root layout
├── public/               # Static assets
├── styles/              # Global styles
├── lib/                 # Utility functions
└── types/               # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Performance Optimization

- Implements Next.js Image optimization
- Uses dynamic imports for code splitting
- Implements proper caching strategies
- Optimizes fonts and icons loading

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- React Icons for the beautiful icon set

## Support

For support, email support@slotthing.com or join our Discord community.

---

Made with ❤️ by [Your Name]
