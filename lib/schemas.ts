// Defines the structure of the settings panel for each effect type

export type ControlType = 'color' | 'number' | 'boolean' | 'select' | 'colorArray' | 'colorWeights' | 'json' | 'text';

export interface ConfigField {
  key: string;
  label: string;
  type: ControlType;
  min?: number;
  max?: number;
  step?: number;
  options?: string[]; // for select
}

export const effectSchemas: Record<string, ConfigField[]> = {
  'Hero Configuration': [
    { key: 'badge', label: 'Badge Text', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'mediaType', label: 'Media Type', type: 'select', options: ['video', 'image'] },
    { key: 'mediaSrc', label: 'Media Source', type: 'text' },
    { key: 'poster', label: 'Video Poster', type: 'text' },
    { key: 'buttonText', label: 'Primary Button', type: 'text' },
  ],
  'Particle Network': [
    { key: 'backgroundColor', label: 'Background Color', type: 'color' },
    { key: 'particleDensity', label: 'Density (per 100k px²)', type: 'number', min: 0.1, max: 30, step: 0.1 },
    { key: 'particleColor', label: 'Dot Color', type: 'color' },
    { key: 'lineColor', label: 'Line Color', type: 'color' },
    { key: 'connectionDistance', label: 'Link Distance', type: 'number', min: 50, max: 400 },
    { key: 'mouseDistance', label: 'Mouse Radius', type: 'number', min: 50, max: 500 },
    { key: 'baseSpeed', label: 'Base Speed', type: 'number', min: 0, max: 5, step: 0.1 },
    { key: 'interactionStrength', label: 'Push Strength', type: 'number', min: 0, max: 5, step: 0.1 },
    { key: 'resistance', label: 'Friction (1=None)', type: 'number', min: 0.5, max: 0.99, step: 0.01 },
    { key: 'enableMouseInteraction', label: 'Mouse Interaction', type: 'boolean' },
    { key: 'wrapAround', label: 'Wrap Edges', type: 'boolean' },
  ],
  'Gradient Mesh': [
    { key: 'backgroundColor', label: 'Base Color', type: 'color' },
    { key: 'animationSpeed', label: 'Global Speed (s)', type: 'number', min: 1, max: 20 },
    // Complex item array is best handled via the JSON editor in the UI, 
    // but we can add a helper to regenerate random ones if needed, or just rely on JSON.
  ],
  'Retro Grid': [
    { key: 'backgroundColor', label: 'Sky Color', type: 'color' },
    { key: 'gridColor', label: 'Grid Color', type: 'color' },
    { key: 'animationSpeed', label: 'Grid Speed (s)', type: 'number', min: 0.1, max: 5, step: 0.1 },
  ],
  'Sine Waves': [
    { key: 'colorStart', label: 'Gradient Top', type: 'color' },
    { key: 'colorEnd', label: 'Gradient Bottom', type: 'color' },
    { key: 'waveColor', label: 'Wave Color', type: 'color' },
    { key: 'speed', label: 'Flow Speed', type: 'number', min: 0.1, max: 10, step: 0.1 },
    { key: 'amplitude', label: 'Height', type: 'number', min: 10, max: 200 },
    { key: 'parallax', label: 'Parallax Effect', type: 'number', min: 0, max: 1, step: 0.1 },
  ],
  'Floating Shapes': [
    { key: 'backgroundColor', label: 'Background', type: 'color' },
    { key: 'shapeCount', label: 'Count', type: 'number', min: 1, max: 20 },
    { key: 'colors', label: 'Shape Colors', type: 'colorArray' },
  ],
  'Lava Lamp': [
    { key: 'backgroundColor', label: 'Background', type: 'color' },
    { key: 'blobDensity', label: 'Density (per 100k px²)', type: 'number', min: 0.1, max: 10, step: 0.1 },
    { key: 'blobSize', label: 'Blob Size', type: 'number', min: 0.1, max: 3, step: 0.1 },
    { key: 'speed', label: 'Flow Speed', type: 'number', min: 0.1, max: 5, step: 0.1 },
    { key: 'colorStops', label: 'Lava Colors', type: 'colorWeights' },
  ]
};

// Default configs for when adding a new layer
export const defaultConfigs: Record<string, any> = {
  'Hero Configuration': {
      badge: "Web Development for Small Business",
      title: "We build websites that drive real results",
      description: "FluxForge helps local businesses establish a powerful online presence. Modern design, SEO optimization, and easy management — everything you need to grow.",
      mediaType: 'video',
      mediaSrc: "https://cdn.coverr.co/videos/coverr-working-in-a-luxury-office-4623/1080p.mp4",
      poster: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop",
      buttonText: "Book a Free Consultation"
  },
  'Particle Network': {
    particleDensity: 0.8,
    connectionDistance: 248,
    mouseDistance: 125,
    particleColor: '#64c8ff',
    lineColor: 'rgba(100, 200, 255, 0.2)', 
    baseSpeed: 0.8,          
    interactionStrength: 0.3, 
    resistance: 0.76,        
    enableMouseInteraction: true,
    wrapAround: false,       
    backgroundColor: 'transparent',
  },
  'Gradient Mesh': {
    backgroundColor: 'rgba(0, 0, 0, 0.49)',
    animationSpeed: 7,
    items: [
        { 
            color: "#fbbf24", 
            top: "20%", 
            left: "80%", 
            width: "30vw", 
            height: "30vw", 
            opacity: 0.2, 
            animationDelay: "0s", 
            animationDuration: "15s" 
        },
        { 
            color: "#d97706", 
            top: "70%", 
            left: "10%", 
            width: "25vw", 
            height: "25vw", 
            opacity: 0.15, 
            animationDelay: "4s", 
            animationDuration: "12s" 
        }
    ]
  },
  'Retro Grid': {
    gridColor: "rgba(174, 170, 167, 1)",
    backgroundColor: "rgba(69, 58, 58, 0.2)",
    animationSpeed: 5,
  },
  'Sine Waves': {
    colorStart: '#1e1b4b',
    colorEnd: '#312e81',
    waveColor: 'rgba(129, 140, 248, 0.3)',
    speed: 1,
    amplitude: 50,
    parallax: 1,
  },
  'Floating Shapes': {
    backgroundColor: "#0f172a",
    shapeCount: 6,
    colors: [
        "#38bdf8",
        "#818cf8",
        "#c084fc",
        "#2dd4bf"
    ]
  },
  'Lava Lamp': {
    backgroundColor: '#1a0032',
    speed: 1.0,
    blobDensity: 1.0,
    blobSize: 1.0,
    colorStops: [
        { color: '#f59e0b', weight: 50 },
        { color: '#7c3aed', weight: 50 }
    ]
  }
};