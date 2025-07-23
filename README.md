# Lazarus Home Remodeling Website

A modern, responsive website for Lazarus Home Remodeling showcasing their comprehensive home renovation services.

## Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, professional design with smooth animations
- **Service Showcase**: Detailed pages for different remodeling services
- **Before/After Gallery**: Visual demonstrations of completed projects
- **Client Testimonials**: Customer reviews and ratings
- **Contact Integration**: Easy quote request system
- **AI-Powered Chat**: OpenAI integration with intelligent customer assistance
- **CCU Diagnostic System**: Advanced troubleshooting with Claude Computer Use integration

## Pages

- **Home** (`index.html`): Main landing page with hero section, services overview, and testimonials
- **Services** (`services.html`): Detailed service offerings including:
  - Kitchen Remodeling
  - Bathroom Remodeling
  - Whole Home Remodeling
  - Exterior Remodeling

## Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Styling via Tailwind CSS CDN
- **JavaScript**: Interactive elements and chat widget
- **Google Fonts**: Newsreader and Noto Sans typography
- **Responsive Design**: Container queries and mobile-first approach

## Project Structure

```
lazarus/
├── public/                 # Website files
│   ├── index.html          # Main landing page
│   ├── services.html       # Services showcase page
│   ├── about.html          # About page
│   ├── contact.html        # Contact page
│   ├── gallery.html        # Project gallery
│   ├── blog.html           # Blog page
│   └── chat.js             # AI chat system
├── diagnostic-tools/       # CCU diagnostic system
│   ├── chat-diagnostic.html # Visual diagnostic interface
│   ├── console-diagnostic.js # Browser console diagnostic
│   ├── CCU-INSTRUCTIONS.md  # CCU usage guide
│   ├── upload-to-ccu.sh    # Automated FTP upload
│   └── README.md           # Diagnostic tools documentation
├── readme/                 # Complete documentation
│   ├── CCU_DIAGNOSTIC_SYSTEM.md # CCU integration guide
│   ├── TROUBLESHOOTING.md  # General troubleshooting
│   └── index.md            # Documentation index
├── Dockerfile              # Container configuration
├── server.js               # Backend server with OpenAI integration
├── fly.toml                # Fly.io deployment config
└── README.md               # This file
```

## Services Offered

### Kitchen Remodeling
Complete kitchen renovations including custom cabinetry, countertops, modern appliances, and lighting solutions.

### Bathroom Remodeling
Spa-like bathroom retreats with updated fixtures, tiling, and space optimization for luxury and functionality.

### Whole Home Remodeling
Comprehensive home renovations to update style, improve functionality, and increase property value.

### Exterior Remodeling
Curb appeal enhancements including siding, roofing, landscaping, and outdoor living spaces.

## Deployment

The website is containerized using Docker and configured for deployment on Fly.io:

```bash
# Build Docker image
docker build -t lazarus-website .

# Deploy to Fly.io
fly deploy
```

## Development

To run locally:

1. Open `public/index.html` in your browser
2. Or serve with a local HTTP server:
   ```bash
   cd public
   python -m http.server 8000
   ```

## Features in Detail

### Interactive Elements
- Chat widget with toggle functionality
- Responsive navigation
- Before/after image galleries
- Service highlight cards

### Design System
- **Colors**: Professional black (#141414) and gray (#757575) palette
- **Typography**: Newsreader for headings, Noto Sans for body text
- **Layout**: Container-based responsive design
- **Components**: Consistent button styles and card layouts

## Contact Information

**Lazarus Home Remodeling**
- Phone: (586) 248-8888
- Tagline: "Revive. Restore. Remarkable."

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-responsive design
- Progressive enhancement approach

## License

© 2024 Lazarus Home Remodeling. All rights reserved.