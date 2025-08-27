# Overview

This is a Progressive Web App (PWA) alarm clock application built with React, TypeScript, and Express. The app functions as a reliable local alarm clock that works offline, storing all alarm data in the browser's localStorage. It features a modern, responsive UI with light/dark theme support and provides comprehensive alarm management capabilities including custom tones, snooze functionality, and various dismiss methods.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the main UI framework
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management (though minimal server interaction)
- **React Hook Form** with Zod validation for form handling
- **Tailwind CSS** with **shadcn/ui** component library for styling
- **Custom theme system** supporting light/dark modes with CSS variables

## Progressive Web App Features
- **Service Worker** implementation for offline functionality and caching
- **Web App Manifest** for installable app experience
- **Web API integrations** including Notifications API, Wake Lock API, and Web Audio API
- **localStorage-based** data persistence for offline-first approach

## Backend Architecture
- **Express.js** server with minimal API endpoints (primarily health check)
- **Development-only Vite integration** for hot module replacement
- **Static file serving** for production builds
- **TypeScript** throughout the entire stack

## Data Storage
- **Browser localStorage** as the primary data store for all alarm data
- **In-memory storage** class for potential server-side data (currently unused)
- **Drizzle ORM** configured for PostgreSQL (prepared for future database integration)
- **Zod schemas** for runtime type validation and data modeling

## Audio Management
- **Web Audio API** for alarm sound playback with gradual volume control
- **Custom AudioManager** class handling sound initialization, playback, and cleanup
- **Default tone library** with fallback browser beep functionality
- **Support for custom alarm tones** via URL-based audio files

## Alarm Scheduling System
- **Custom AlarmScheduler** class managing alarm timing and execution
- **Wake Lock API** integration to prevent device sleep during alarms
- **Snooze functionality** with configurable duration and maximum snooze counts
- **Multiple dismiss methods** (tap, math problems, shake detection)
- **Repeat scheduling** supporting daily, weekdays, weekends, and custom patterns

## State Management
- **React Context** for theme management
- **Custom hooks** for alarm management and mobile detection
- **localStorage wrapper** providing CRUD operations for alarm data
- **Real-time clock updates** with setInterval for current time display

## UI Component Architecture
- **shadcn/ui** as the base component library built on Radix UI primitives
- **Responsive design** with mobile-first approach
- **Custom components** for alarm-specific functionality (AlarmCard, AlarmForm, AlarmRingingOverlay)
- **Toast notifications** for user feedback
- **Modal/overlay system** for alarm ringing interface

# External Dependencies

## Core Framework Dependencies
- **React 18** - Frontend framework
- **Express.js** - Backend server framework
- **TypeScript** - Type safety across the stack
- **Vite** - Build tool and development server

## UI and Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI component primitives
- **shadcn/ui** - Pre-built component library
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant management
- **clsx & tailwind-merge** - Conditional class name utilities

## Data Management
- **Zod** - Schema validation and type inference
- **React Hook Form** - Form state management
- **@hookform/resolvers** - Form validation resolvers
- **TanStack React Query** - Server state management
- **nanoid** - Unique ID generation

## Database (Configured but Unused)
- **Drizzle ORM** - TypeScript ORM for PostgreSQL
- **@neondatabase/serverless** - Serverless PostgreSQL client
- **drizzle-zod** - Zod integration for Drizzle schemas

## Development Tools
- **tsx** - TypeScript execution for Node.js
- **esbuild** - Fast JavaScript bundler
- **@replit/vite-plugin-runtime-error-modal** - Development error handling
- **@replit/vite-plugin-cartographer** - Replit-specific development tools

## Progressive Web App
- **Service Worker** - Browser caching and background processing
- **Web APIs** - Notifications, Wake Lock, Web Audio for alarm functionality

## Routing and Navigation
- **wouter** - Lightweight client-side routing library

## Utility Libraries
- **date-fns** - Date manipulation and formatting
- **embla-carousel-react** - Carousel component functionality