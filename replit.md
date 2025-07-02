# VR Chemistry Lab

## Overview

This is a comprehensive VR Chemistry Lab application built with React Three Fiber and Express.js. The application provides an immersive virtual reality experience for conducting pH testing experiments in a 3D chemistry laboratory environment. Users can interact with laboratory equipment, conduct experiments with test strips and beakers, and learn about chemical properties through hands-on virtual experiences.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **3D Rendering**: React Three Fiber (@react-three/fiber) with Three.js
- **VR Support**: @react-three/xr for WebXR VR capabilities
- **UI Components**: Radix UI primitives with custom Tailwind CSS styling
- **State Management**: Zustand for predictable state management
- **Build Tool**: Vite with hot module replacement
- **Styling**: Tailwind CSS with CSS custom properties for theming

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Development**: tsx for TypeScript execution
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API structure with /api prefix

### Key Technologies
- **3D Graphics**: Three.js ecosystem with React Three Fiber
- **VR/AR**: React Three XR for immersive experiences
- **Physics**: Custom physics utilities for lab interactions
- **Audio**: HTML5 Audio API with mute controls
- **Responsive Design**: Mobile-first approach with VR fallbacks

## Key Components

### 3D Lab Environment
- **ChemistryLab**: Main 3D scene orchestrator with physics updates
- **LabEnvironment**: Physical lab setup (floors, walls, benches, lighting)
- **LabEquipment**: Interactive lab equipment (beakers, test strips)
- **PHTestStrip**: Interactive pH testing strips with color-changing chemistry

### User Interface
- **LabUI**: Overlay interface showing experiment progress and controls
- **VRControls**: VR-specific interaction handlers
- **Interface**: Game-like interface with audio controls and restart functionality

### State Management
- **useChemistryLab**: Core lab simulation state (beakers, test strips, experiments)
- **useAudio**: Audio system management (background music, sound effects)
- **useGame**: Game phase management (ready, playing, ended states)

### Physics & Chemistry Simulation
- **labPhysics**: Collision detection and 3D spatial calculations
- **phChemistry**: pH value calculations and color mapping algorithms

## Data Flow

1. **Initialization**: Lab components initialize with default beaker positions and pH values
2. **User Interaction**: Keyboard/VR controls trigger state updates through Zustand stores
3. **Physics Updates**: Frame-based physics calculations update object positions and interactions
4. **Chemistry Simulation**: pH testing generates realistic color changes and results
5. **Progress Tracking**: Completed experiments update overall lab progress
6. **Audio Feedback**: User actions trigger appropriate sound effects (when unmuted)

## External Dependencies

### Core Runtime
- **@neondatabase/serverless**: Serverless PostgreSQL database connections
- **drizzle-orm**: Type-safe database operations
- **express**: Web server framework

### 3D Graphics & VR
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for React Three Fiber
- **@react-three/postprocessing**: Post-processing effects
- **@react-three/xr**: WebXR support for VR/AR

### UI Framework
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility

### Development Tools
- **typescript**: Static type checking
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with HMR
- **Backend**: tsx for TypeScript execution with Express
- **Database**: Drizzle kit for schema management and migrations
- **Hot Reload**: Automatic reloading for both frontend and backend changes

### Production Build
- **Frontend**: Vite builds to `dist/public` with asset optimization
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Assets**: Support for 3D models (.gltf, .glb) and audio files
- **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **DATABASE_URL**: Required environment variable for PostgreSQL connection
- **Static Assets**: Served from Express in production mode
- **Error Handling**: Comprehensive error boundaries and API error responses

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
- July 01, 2025. Successfully migrated from Replit Agent to Replit environment 
- July 01, 2025. Added Gas Tests experiment with 5 common gas identification tests (H₂, O₂, CO₂, NH₃, Cl₂)
- July 01, 2025. Completed migration to Replit environment - fixed landing page scrolling issue by removing overflow-hidden classes
- July 02, 2025. Fixed VR scaling and stability issues - reduced scene scale to 0.3x for comfortable viewing, disabled desktop camera controls in VR mode to prevent lab movement when turning head, added VR controller height adjustment with thumbstick and shoulder button controls, optimized initial VR positioning for comfortable eye-level viewing
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```