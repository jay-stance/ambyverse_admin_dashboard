# Admin Dashboard - Sickle Cell Platform

A comprehensive admin dashboard for managing the Sickle Cell Platform, built with Next.js 15, TypeScript, Tailwind CSS, and Shadcn UI components.

## Features

### Authentication
- **Login** - Admin-only authentication with email/password
- **Forgot Password** - Request OTP for password reset
- **Reset Password** - Reset password using OTP code

### Dashboard Pages

| Page | Description |
|------|-------------|
| **Overview** | Dashboard with stats, user distribution, platform activity, and quick actions |
| **Users** | User management with search, filters, and create admin functionality |
| **Verify** | Verification management for NGOs, hospitals, and organizations |
| **Analytics** | Comprehensive charts for pain trends, demographics, and platform metrics |
| **Broadcast** | Send notifications to all users or targeted groups |
| **Reports** | Generate and download platform reports |
| **Connections** | View and manage connections between warriors, guardians, and caregivers |
| **Tasks** | Monitor task requests across the platform |
| **Pain Logs** | Dashboard showing pain entries and crisis events |
| **Streakable Items** | Create and manage habit tracking items |
| **Activity Logs** | Audit trail of user actions |
| **Settings** | Profile, security, system status, and admin management |

## Tech Stack

- **Framework**: Next.js 15.1.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Charts**: Recharts
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## Project Structure

```
src/
├── app/
│   ├── (auth)/            # Authentication pages
│   │   ├── login/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── users/
│   │   ├── verify/
│   │   ├── analytics/
│   │   ├── broadcast/
│   │   ├── reports/
│   │   ├── connections/
│   │   ├── tasks/
│   │   ├── pain-logs/
│   │   ├── streakable-items/
│   │   ├── activity-logs/
│   │   ├── settings/
│   │   └── page.tsx       # Overview page
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── ui/                # Shadcn UI components
├── context/
│   └── AuthContext.tsx
└── lib/
    ├── api/
    │   ├── auth.ts
    │   └── admin.ts
    ├── types.ts
    └── utils.ts
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository and navigate to the admin-dashboard directory:
   ```bash
   cd admin-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Production Build

Build for production:
```bash
npm run build
npm run start
```

## API Integration

The dashboard is designed to work with a backend API. Update the `NEXT_PUBLIC_API_URL` environment variable to point to your API server.

### Expected API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User authentication |
| `/auth/forgot-password` | POST | Request password reset OTP |
| `/auth/reset-password` | POST | Reset password with OTP |
| `/admin/stats` | GET | Dashboard statistics |
| `/admin/users` | GET | List users with filtering |
| `/admin/users` | POST | Create new admin user |
| `/admin/analytics` | GET | Analytics data |
| `/admin/verification-requests` | GET | Verification requests |
| `/admin/verification-requests/:id` | PUT | Update verification status |
| `/admin/broadcasts` | GET/POST | Manage broadcasts |
| `/connections` | GET | List connections |
| `/tasks` | GET | List task requests |
| `/pain-logs` | GET | List pain logs |
| `/streakable-items` | GET/POST/DELETE | Manage streakable items |
| `/user-actions` | GET | Activity logs |

## Design

The dashboard follows the Figma design specifications with:
- Dark sidebar navigation
- Clean, modern card-based layouts
- Consistent color scheme and typography
- Responsive design for all screen sizes
- Rich data visualizations with Recharts

## License

This project is part of the Sickle Cell Platform.
