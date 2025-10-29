# Navigation System

## Overview

The TAK mobile game implements a comprehensive navigation system using Expo Router with proper screen transitions and user flow management.

## Screen Structure

### Main Menu (`/` - index.tsx)
- **Purpose**: Entry point of the application
- **Features**:
  - Animated title and menu buttons
  - Navigation to board size selection, settings, and about screens
  - Modern design with smooth fade-in animations
- **Navigation**:
  - "New Game" → `/board-size`
  - "Settings" → `/settings`
  - "About" → `/about`

### Board Size Selection (`/board-size`)
- **Purpose**: Allow players to choose game complexity
- **Features**:
  - 5 board size options (4x4 to 8x8)
  - Detailed piece count preview for each option
  - Game duration estimates
  - Recommended option highlighting (5x5)
  - Staggered card animations
- **Navigation**:
  - "Back" → Previous screen
  - "Start [Game Type]" → `/game?boardSize=[size]`

### Game Screen (`/game`)
- **Purpose**: Main gameplay interface
- **Features**:
  - Accepts board size parameter from URL
  - Initializes game with selected board size
  - Full game flow management
  - Return to menu and restart options
- **Navigation**:
  - "Menu" → Back to main menu
  - Victory modal → New game or main menu

### Settings Screen (`/settings`)
- **Purpose**: Game configuration and preferences
- **Features**:
  - Game settings (move hints, animations, confirm moves)
  - Audio & haptics settings
  - Data & storage options
  - Appearance settings (dark mode)
  - Reset to defaults functionality
- **Navigation**:
  - "Back" → Previous screen

### About Screen (`/about`)
- **Purpose**: Game information and rules
- **Features**:
  - Game description and history
  - How to play instructions
  - Board size information
  - Credits and version info
  - External link to learn more
- **Navigation**:
  - "Back" → Previous screen
  - "Learn More Online" → External website

## Navigation Flow

```
Main Menu (/)
├── New Game → Board Size Selection (/board-size)
│   └── Start Game → Game Screen (/game?boardSize=X)
│       ├── Menu → Main Menu (/)
│       └── Victory → New Game or Main Menu
├── Settings → Settings Screen (/settings)
│   └── Back → Main Menu (/)
└── About → About Screen (/about)
    └── Back → Main Menu (/)
```

## Screen Transitions

The app uses Expo Router's built-in navigation with custom animations:

- **Main Menu**: Fade animation for entry
- **Board Size**: Slide from right with staggered card animations
- **Game**: Slide from right
- **Settings**: Slide from bottom (modal-style)
- **About**: Slide from bottom (modal-style)

## Implementation Details

### URL Parameters
- Game screen accepts `boardSize` parameter to initialize with specific board size
- Parameters are properly typed and validated

### Animation System
- Smooth transitions between screens
- Individual component animations (fade, slide, scale)
- Staggered animations for lists and cards
- Performance-optimized with native driver

### Error Handling
- Graceful fallbacks for missing parameters
- Proper navigation state management
- User feedback for invalid actions

### Accessibility
- Screen reader support
- Proper navigation semantics
- Keyboard navigation support

## Testing

Navigation flow is tested with integration tests covering:
- Main menu to board size to game flow
- Back navigation functionality
- Settings and about screen navigation
- URL parameter handling

## Future Enhancements

- Deep linking support for sharing game states
- Navigation history management
- Custom transition animations
- Gesture-based navigation
- Breadcrumb navigation for complex flows