// Runs once on server startup (Next.js instrumentation hook).
// Seeds default Payload CMS records if the DB is empty.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { getPayload } = await import('payload');
  const { default: config } = await import('./payload.config');

  const payload = await getPayload({ config });

  // Seed default admin user
  const users = await payload.find({ collection: 'users' });
  if (users.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { email: 'admin@structio.dev', password: 'admin' },
    });
    payload.logger.info('Created default admin user: admin@structio.dev / admin');
  }

  // Seed default backgrounds
  const backgrounds = await payload.find({ collection: 'backgrounds' });
  if (backgrounds.totalDocs === 0) {
    const initialBackgrounds: {
      sectionId: string;
      type: 'GradientMesh' | 'RetroGrid' | 'LavaLamp' | 'ParticleNetwork' | 'FloatingShapes' | 'Waves';
      config: Record<string, unknown>;
    }[] = [
      {
        sectionId: 'hero-section',
        type: 'GradientMesh',
        config: {
          backgroundColor: 'rgba(0, 0, 0, 0.49)',
          animationSpeed: 7,
          items: [
            { color: '#fbbf24', top: '20%', left: '80%', width: '30vw', height: '30vw', opacity: 0.2, animationDelay: '0s', animationDuration: '15s' },
            { color: '#d97706', top: '70%', left: '10%', width: '25vw', height: '25vw', opacity: 0.15, animationDelay: '4s', animationDuration: '12s' },
          ],
        },
      },
      {
        sectionId: 'services',
        type: 'RetroGrid',
        config: { gridColor: 'rgba(174, 170, 167, 1)', backgroundColor: 'rgba(69, 58, 58, 0.2)', animationSpeed: 5 },
      },
      {
        sectionId: 'portfolio',
        type: 'FloatingShapes',
        config: { backgroundColor: '#0f172a', shapeCount: 6, colors: ['#38bdf8', '#818cf8', '#c084fc', '#2dd4bf'] },
      },
      {
        sectionId: 'faq',
        type: 'Waves',
        config: { colorStart: '#1e1b4b', colorEnd: '#312e81', waveColor: 'rgba(129, 140, 248, 0.3)', speed: 1, amplitude: 50, parallax: 1 },
      },
      {
        sectionId: 'contact',
        type: 'LavaLamp',
        config: { backgroundColor: '#111', colors: ['#78350f', '#92400e', '#b45309'], speed: 0.3, blobCount: 6 },
      },
    ];

    for (const bg of initialBackgrounds) {
      await payload.create({ collection: 'backgrounds', data: bg });
    }
    payload.logger.info('Seeded Backgrounds collection');
  }
}
