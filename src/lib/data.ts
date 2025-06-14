import type { Design, User } from './types';

const designers: User[] = [
  { id: 'designer1', name: 'Alice Wonderland', avatarUrl: 'https://placehold.co/100x100.png', email: 'alice@example.com' },
  { id: 'designer2', name: 'Bob The Builder', avatarUrl: 'https://placehold.co/100x100.png', email: 'bob@example.com' },
];

const mockDesigns: Design[] = [
  {
    id: 'design1',
    title: 'Futuristic Button Component',
    description: 'A sleek, animated button with a neon glow effect, perfect for modern UI designs.',
    imageUrl: 'https://placehold.co/600x400.png',
    code: {
      html: `<button class="futuristic-button">Click Me</button>`,
      css: `.futuristic-button {\n  background: linear-gradient(to right, #FF00FF, #4B0082);\n  color: white;\n  padding: 15px 30px;\n  border: none;\n  border-radius: 5px;\n  box-shadow: 0 0 10px #FF00FF, 0 0 20px #4B0082;\n  transition: all 0.3s ease;\n}\n.futuristic-button:hover {\n  transform: scale(1.05);\n  box-shadow: 0 0 15px #FF00FF, 0 0 30px #4B0082;\n}`,
      js: `document.querySelector('.futuristic-button').addEventListener('click', () => {\n  console.log('Button clicked!');\n});`,
    },
    designer: designers[0],
    tags: ['button', 'animation', 'neon'],
  },
  {
    id: 'design2',
    title: 'Glassmorphism Card',
    description: 'A stylish card component using the glassmorphism trend, featuring a frosted glass effect.',
    imageUrl: 'https://placehold.co/600x400.png',
    code: {
      html: `<div class="glass-card">\n  <h3>Card Title</h3>\n  <p>Some description here.</p>\n</div>`,
      css: `.glass-card {\n  background: rgba(255, 255, 255, 0.2);\n  border-radius: 16px;\n  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);\n  backdrop-filter: blur(5px);\n  -webkit-backdrop-filter: blur(5px);\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  padding: 20px;\n}`,
      js: `// No JavaScript needed for basic styling`,
    },
    designer: designers[1],
    tags: ['card', 'glassmorphism', 'ui-element'],
  },
  {
    id: 'design3',
    title: 'Interactive Data Chart',
    description: 'A responsive and interactive chart component for data visualization, built with React.',
    imageUrl: 'https://placehold.co/600x400.png',
    code: {
      html: `<div id="chart-container"></div>`,
      css: `/* Chart specific styles */\n#chart-container {\n  width: 100%;\n  height: 300px;\n  border: 1px solid #ccc;\n}`,
      js: `// Example using a charting library like Chart.js or Recharts\n// console.log('Chart component initialized');`,
    },
    designer: designers[0],
    tags: ['chart', 'data', 'interactive'],
  },
];

export async function getDesigns(): Promise<Design[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockDesigns;
}

export async function getDesignById(id: string): Promise<Design | undefined> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockDesigns.find(design => design.id === id);
}

export async function getMockUsers(): Promise<User[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return designers;
}
