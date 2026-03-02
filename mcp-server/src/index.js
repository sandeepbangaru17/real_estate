import { McpServer, StdioServerTransport } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import axios from 'axios';
import { spawn } from 'child_process';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const server = new McpServer({
  name: 'real-estate-mcp-server',
  version: '1.0.0',
});

server.tool(
  'list_lands',
  'Get all lands (properties/fields) from the database',
  {},
  async () => {
    const response = await api.get('/lands');
    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
  }
);

server.tool(
  'get_land',
  'Get a specific land by ID',
  { id: z.string() },
  async ({ id }) => {
    const response = await api.get(`/lands/${id}`);
    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
  }
);

server.tool(
  'create_land',
  'Create a new land (property/field)',
  {
    name: z.string(),
    location: z.string(),
    totalArea: z.number(),
    coordinates: z.array(z.array(z.number())),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
  },
  async (args) => {
    const response = await api.post('/lands', args);
    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
  }
);

server.tool(
  'update_land',
  'Update an existing land',
  {
    id: z.string(),
    name: z.string().optional(),
    location: z.string().optional(),
    totalArea: z.number().optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
  },
  async ({ id, ...args }) => {
    const response = await api.put(`/lands/${id}`, args);
    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
  }
);

server.tool(
  'delete_land',
  'Delete a land by ID',
  { id: z.string() },
  async ({ id }) => {
    await api.delete(`/lands/${id}`);
    return { content: [{ type: 'text', text: JSON.stringify({ success: true, message: 'Land deleted' }) }] };
  }
);

server.tool(
  'list_plots',
  'Get all plots for a specific land',
  { landId: z.string() },
  async ({ landId }) => {
    const response = await api.get(`/plots/land/${landId}`);
    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
  }
);

server.tool(
  'get_plot',
  'Get a specific plot by ID',
  { id: z.string() },
  async ({ id }) => {
    const response = await api.get(`/plots/${id}`);
    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
  }
);

server.tool(
  'create_plot',
  'Create a new plot within a land',
  {
    landId: z.string(),
    plotNumber: z.string(),
    area: z.number(),
    coordinates: z.array(z.array(z.number())),
    status: z.enum(['available', 'sold']).optional(),
    price: z.number().optional(),
    dimensions: z.object({ width: z.number(), length: z.number() }).optional(),
  },
  async (args) => {
    const response = await api.post('/plots', args);
    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
  }
);

server.tool(
  'update_plot',
  'Update an existing plot',
  {
    id: z.string(),
    plotNumber: z.string().optional(),
    area: z.number().optional(),
    status: z.enum(['available', 'sold']).optional(),
    price: z.number().optional(),
    dimensions: z.object({ width: z.number(), length: z.number() }).optional(),
  },
  async ({ id, ...args }) => {
    const response = await api.put(`/plots/${id}`, args);
    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
  }
);

server.tool(
  'delete_plot',
  'Delete a plot by ID',
  { id: z.string() },
  async ({ id }) => {
    await api.delete(`/plots/${id}`);
    return { content: [{ type: 'text', text: JSON.stringify({ success: true, message: 'Plot deleted' }) }] };
  }
);

server.tool(
  'get_plot3d',
  'Get 3D model data for a specific plot',
  { plotId: z.string() },
  async ({ plotId }) => {
    const response = await api.get(`/plot/${plotId}`);
    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
  }
);

server.tool(
  'create_plot3d',
  'Create 3D model data for a plot',
  {
    plotId: z.string(),
    modelUrl: z.string().optional(),
    dimensions: z.object({ width: z.number(), length: z.number(), height: z.number() }).optional(),
    houseModel: z.string().optional(),
    colors: z.object({ wall: z.string(), roof: z.string(), ground: z.string() }).optional(),
  },
  async (args) => {
    const response = await api.post('/', args);
    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
  }
);

server.tool(
  'update_plot3d',
  'Update 3D model data for a plot',
  {
    id: z.string(),
    modelUrl: z.string().optional(),
    dimensions: z.object({ width: z.number(), length: z.number(), height: z.number() }).optional(),
    houseModel: z.string().optional(),
    colors: z.object({ wall: z.string(), roof: z.string(), ground: z.string() }).optional(),
  },
  async ({ id, ...args }) => {
    const response = await api.put(`/${id}`, args);
    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
  }
);

const transport = new StdioServerTransport();
await server.run(transport);
