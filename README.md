<div align="center">
  <img src="/public/logo.svg" alt="SlotThing Logo" width="120" height="120" />
  
  <h1 align="center">SlotThing</h1>
  <p align="center">Modern Slot Game Platform</p>

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

  <br />
  
  <img src="/11.jpeg" alt="SlotThing Platform Preview" width="800" style="border-radius: 10px; margin: 20px 0;" />

  <p align="center">
    A modern, responsive slot game platform built with Next.js 14, featuring real-time gameplay, 
    user dashboard, and seamless mobile experience.
  </p>
</div>

<div align="center">
  <h3>
    <a href="https://slotthing.com">View Demo</a>
    <span> · </span>
    <a href="https://docs.slotthing.com">Documentation</a>
    <span> · </span>
    <a href="https://github.com/cogniasys/slotthing/issues">Report Bug</a>
  </h3>
</div>

## ✨ Features

- 🎮 Multiple slot game variations
- 📱 Responsive design with mobile-first approach
- 📊 Real-time game statistics
- 💎 Virtual currency and diamond system
- 🔒 Secure user authentication
- 📈 Personal dashboard with game history
- 🎨 Beautiful UI with backdrop blur effects
- ✨ Modern design with smooth animations

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) with App Router
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **State Management:** React Context
- **Icons:** [React Icons](https://react-icons.github.io/react-icons/)
- **Animations:** Tailwind CSS transitions
- **Font:** Montserrat & Playfair Display

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.17 or later
- npm or yarn package manager
- Git for version control

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/cogniasys/slotthing.git
   cd slotthing
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 📱 Mobile-First Approach

The platform features a responsive design that works seamlessly across all devices:

- 🖥️ **Desktop:** Full sidebar navigation with expanded features
- 📱 **Tablet:** Adaptive layout with collapsible sidebar
- 📱 **Mobile:** Bottom navigation bar with quick access to essential features

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

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/fabiamino">Fabian Amino</a></p>
  
  <a href="https://twitter.com/slotthing">
    <img src="https://img.shields.io/twitter/follow/slotthing?style=social" alt="Twitter Follow" />
  </a>
  <a href="https://discord.gg/slotthing">
    <img src="https://img.shields.io/discord/1234567890?style=flat&logo=discord" alt="Discord" />
  </a>
</div>