# TMS of Emerald Coast App

A mobile application for TMS of Emerald Coast, providing information about Transcranial Magnetic Stimulation therapy and services.

## Project Structure

```
/app                    # Expo Router app directory
│   ├── _layout.js      # Root layout configuration
│   ├── index.js        # Home screen
│   ├── about.js        # About screen
│   ├── contact.js      # Contact screen
│   ├── treatment.js    # Treatment screen
│   └── new-patients.js # New patients screen
│
├── /assets             # Fonts, images, videos, etc.
│   └── /images
│
├── /src                # Source code
│   ├── /components     # Reusable UI components
│   │   └── AppBar.js
│   │
│   ├── /constants      # Constant values
│   │   ├── Colors.js
│   │   ├── Fonts.js
│   │   └── Layout.js
│   │
│   ├── /context        # React Contexts
│   │
│   ├── /hooks          # Custom hooks
│   │
│   ├── /services       # API services, network logic
│   │
│   ├── /types          # TypeScript types and interfaces
│   │
│   ├── /utils          # Utility functions/helpers
│   │   └── validation.js
│   │
│   └── /i18n           # Localization
│
├── app.json            # Expo config
└── package.json        # Dependencies and scripts
```

## Features

- Home screen with information about TMS therapy
- About page with details about the clinic
- Treatment information page
- New patients information page
- Contact page with form and clinic details
- Consistent app bar navigation across all screens

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

## Built With

- React Native
- Expo
- Expo Router
