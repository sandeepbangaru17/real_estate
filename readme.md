# Real Estate Visualization Platform

A full-stack real estate web application where users can view lands, explore subdivided plots on an interactive map, and visualize properties in 3D.

## Features

- **User Authentication** - JWT-based login system
- **Lands Management** - View and manage land properties
- **Interactive Maps** - Leaflet-based map with polygon overlays
- **Plot Management** - Subdivided plots with availability status
- **3D Visualization** - Three.js powered property previews
- **REST API** - Complete backend API
- **MCP Server** - AI assistant integration via Model Context Protocol
- **CLI Client** - Command-line interface for data management

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Leaflet.js (Maps)
- React Three Fiber / Three.js (3D)
- React Router DOM

### Backend
- Node.js
- Express.js
- Sequelize (SQLite)
- JWT Authentication

### Additional
- MCP Server (AI Integration)
- CLI Client
- Mintlify Documentation

## Project Structure

```
real_estate/
├── backend/              # Express.js API server
│   ├── config/          # Database configuration
│   ├── models/          # Sequelize models
│   ├── routes/         # API endpoints
│   └── server.js       # Server entry point
│
├── frontend/            # React application
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   │   ├── MapView.jsx
│   │   │   └── ThreeViewer.jsx
│   │   ├── pages/      # Page components
│   │   │   ├── LandsPage.jsx
│   │   │   ├── PlotsPage.jsx
│   │   │   ├── Plot3DPage.jsx
│   │   │   └── LoginPage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── cli/                # Node.js CLI client
│   └── src/
│       ├── commands/   # CLI commands
│       ├── utils/      # API utilities
│       └── index.js    # CLI entry point
│
├── mcp-server/         # MCP Server for AI
│   ├── src/
│   │   └── index.js   # MCP server implementation
│   └── docs/           # Mintlify documentation
│
└── readme.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real_estate
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   npm start
   ```
   Backend runs on `http://localhost:5000`

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

### Demo Credentials

- Email: `admin@realestate.com`
- Password: `admin123`

## API Endpoints

### Lands

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lands` | Get all lands |
| GET | `/api/lands/:id` | Get land by ID |
| POST | `/api/lands` | Create land |
| PUT | `/api/lands/:id` | Update land |
| DELETE | `/api/lands/:id` | Delete land |

### Plots

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plots/land/:landId` | Get plots by land |
| GET | `/api/plots/:id` | Get plot by ID |
| POST | `/api/plots` | Create plot |
| PUT | `/api/plots/:id` | Update plot |
| DELETE | `/api/plots/:id` | Delete plot |

### Plot 3D

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plot/:plotId` | Get 3D model |
| POST | `/api/` | Create 3D model |
| PUT | `/api/:id` | Update 3D model |

## MCP Server

The MCP (Model Context Protocol) server provides AI assistants with access to the Real Estate API.

### Setup

```bash
cd mcp-server
npm install
npm start
```

### Available Tools (13)

**Lands:**
- `list_lands` - Get all lands
- `get_land` - Get land by ID
- `create_land` - Create new land
- `update_land` - Update land
- `delete_land` - Delete land

**Plots:**
- `list_plots` - Get plots by land
- `get_plot` - Get plot by ID
- `create_plot` - Create new plot
- `update_plot` - Update plot
- `delete_plot` - Delete plot

**3D Models:**
- `get_plot3d` - Get 3D model
- `create_plot3d` - Create 3D model
- `update_plot3d` - Update 3D model

### Documentation

MCP Server documentation is available in `mcp-server/docs/`

To view with Mintlify (requires Node.js 20+):
```bash
cd mcp-server
npx mintlify dev
```

## CLI Client

A command-line interface for managing lands and plots.

### Setup

```bash
cd cli
npm install
npm link
```

### Usage

```bash
re-cli
```

Options:
- List/Create/Update/Delete lands
- List/Create/Update/Delete plots
- Import/Export data as JSON

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/realestate
JWT_SECRET=your_secret_key
```

### Frontend
Configure API proxy in `vite.config.js`

### MCP Server (.env)
```env
API_URL=http://localhost:5000/api
```

## System Flow

```
Login → Lands List → Click Land → View Plots → Click Plot → 3D Visualization
```

## Database Schema

### Land
```javascript
{
  name: String,
  location: String,
  totalArea: Number,
  coordinates: [[lat, lng], ...],
  description: String,
  imageUrl: String
}
```

### Plot
```javascript
{
  landId: ObjectId,
  plotNumber: String,
  area: Number,
  coordinates: [[lat, lng], ...],
  status: "available" | "sold",
  price: Number,
  dimensions: { width, length }
}
```

### Plot3D
```javascript
{
  plotId: ObjectId,
  modelUrl: String,
  dimensions: { width, length, height },
  houseModel: String,
  colors: { wall, roof, ground }
}
```

## Future Enhancements

- Compass direction (North-facing plots)
- Area measurement tool
- Sunlight & shadow simulation
- House construction preview
- VR walkthrough
- Booking system
- Payment integration

## License

MIT License

## Author

Sandeep Bangaru
Full Stack Developer | Real Estate Tech Builder
