# CoreComply Design System

A comprehensive design system for CoreComply built with React 18, TypeScript, TailwindCSS, and Storybook 8. This system provides reusable components, page templates, and automated Figma integration for a consistent user experience across the compliance management platform.

## Features

- ✅ **React 18 + TypeScript** - Modern React with full TypeScript support
- 🎨 **Design Tokens** - CSS variables synchronized from Figma
- 📚 **Storybook 8** - Interactive component documentation with a11y testing
- 🔄 **Figma Sync** - Automated asset and token synchronization
- 🚀 **Azure DevOps CI/CD** - Automated pipelines for deployment
- ♿ **Accessibility** - Built-in a11y addon for compliance testing
- 📱 **Responsive** - Mobile-first design approach

## Quick Start

### Installation

```bash
npm install
```

### Run Storybook

```bash
npm run storybook
```

Storybook will open at [http://localhost:6006](http://localhost:6006)

### Run Dev Server

```bash
npm run dev
```

Application will run at [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
# Build application
npm run build

# Build Storybook
npm run build-storybook
```

## Project Structure

```
corecomply-design-system/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Tabs.tsx
│   │   ├── Table.tsx
│   │   ├── Drawer.tsx
│   │   ├── Badge.tsx
│   │   ├── Alert.tsx
│   │   ├── EmptyState.tsx
│   │   └── Breadcrumb.tsx
│   ├── pages-templates/     # Page templates
│   │   ├── Dashboard.tsx
│   │   ├── Controls.tsx
│   │   ├── Policies.tsx
│   │   ├── Frameworks.tsx
│   │   ├── Audits.tsx       # Includes "COMING SOON" Payroll Audit banner
│   │   ├── Staff.tsx
│   │   └── Integrations.tsx
│   └── styles/
│       └── index.css        # Global styles
├── design/
│   ├── icons/svg/           # Figma-synced icons
│   ├── logos/png/           # Figma-synced logos
│   └── tokens/
│       ├── tokens.css       # Design tokens (CSS variables)
│       └── tokens.json      # Design tokens (JSON)
├── scripts/figma/
│   ├── pull-assets.mjs      # Sync icons/logos from Figma
│   └── pull-variables.mjs   # Sync design tokens from Figma
└── .ado/                    # Azure DevOps pipelines
    ├── azure-pipelines.figma.yml
    └── azure-pipelines.storybook.yml
```

## Components

### Core Components

- **Button** - Primary, secondary, ghost, and destructive variants
- **Card** - Container with optional title and shadow
- **Input** - Text input with label and error states
- **Select** - Dropdown selection with options
- **Tabs** - Tabbed navigation interface
- **Table** - Generic data table with custom columns
- **Drawer** - Sliding side panel
- **Badge** - Status and category indicators
- **Alert** - Info, success, warning, and error alerts
- **EmptyState** - Placeholder for empty content
- **Breadcrumb** - Navigation breadcrumbs

### Page Templates

All page templates include realistic mock data and demonstrate best practices:

- **Dashboard** - KPI cards and activity feed
- **Controls** - Filter bar, data table, and drawer
- **Policies** - Template gallery and publishing workflow
- **Frameworks** - Compliance framework progress tracking
- **Audits** - Framework audit summary + Payroll Audit (with AI coming soon banner)
- **Staff** - Staff directory and timesheets/payslips layout
- **Integrations** - Connections, mappings, and sync logs

## Figma Integration

### Prerequisites

Set up the following environment variables:

- `FIGMA_TOKEN` - Your Figma personal access token
- `FIGMA_FILE_KEY` - Your Figma file key from the URL

### Manual Sync

```bash
npm run figma:pull
```

This will:
1. Download all icons (SVG) and logos (PNG) from Figma
2. Export design tokens to `design/tokens/tokens.css` and `tokens.json`
3. Update CSS variables used by TailwindCSS

### Automated Sync

The Azure DevOps pipeline `.ado/azure-pipelines.figma.yml` runs nightly at 2:00 AM to automatically sync design assets and tokens from Figma.

## Azure DevOps Pipelines

### Setup

1. Create service connection in Azure DevOps
2. Set pipeline variables (see `.ado/service-connection.README.md`)
3. Configure the following secrets:
   - `FIGMA_TOKEN`
   - `FIGMA_FILE_KEY`

### Figma Sync Pipeline

- **Trigger**: Nightly at 2:00 AM
- **Actions**: Pull assets, commit changes, publish artifacts

### Storybook Pipeline

- **Trigger**: Commits to `main` and `develop` branches
- **Actions**: Build Storybook, publish artifacts

## Consuming the Design System

### In Your Application

You can consume this design system in multiple ways:

#### 1. Copy Components Directly

```tsx
import { Button } from './components/Button';
import { Card } from './components/Card';

function MyApp() {
  return (
    <Card title="Welcome">
      <Button>Get Started</Button>
    </Card>
  );
}
```

#### 2. Add as Git Submodule

```bash
git submodule add <repo-url> design-system
```

#### 3. Publish as NPM Package

Build and publish to your private NPM registry.

## Design Tokens

Design tokens are CSS variables defined in `design/tokens/tokens.css`:

```css
:root {
  --corecomply-theme-primary: #111827;
  --corecomply-theme-accent: #10B981;
  --corecomply-theme-surface: #ffffff;
  --corecomply-theme-muted: #6B7280;
  --corecomply-radius-lg: 12px;
  --corecomply-radius-2xl: 16px;
}
```

These tokens are automatically synchronized from Figma and used by TailwindCSS.

## Testing

### Accessibility Testing

Storybook includes the a11y addon for automated accessibility testing:

1. Open Storybook
2. Navigate to any component
3. Click the "Accessibility" tab
4. Review violations and warnings

### Unit Testing

```bash
npm run test
```

## Development Guidelines

### Adding New Components

1. Create component in `src/components/`
2. Add TypeScript types
3. Create `.stories.tsx` file for Storybook
4. Export from component file

### Styling

- Use TailwindCSS utility classes
- Reference design tokens via CSS variables
- Follow mobile-first responsive design
- Maintain consistent spacing and borders

## Special Features

### Payroll Audit (Coming Soon)

The Audits page template includes a prominent banner:

> **COMING SOON: An intelligent AI-based payroll audit tool is in development.**

This banner is displayed in the Payroll Audit tab and can be viewed in Storybook.

## License

Private - CoreComply Internal Use Only

## Support

For questions or issues:
- Check Storybook documentation
- Review Azure DevOps pipeline logs
- Contact the design system team
