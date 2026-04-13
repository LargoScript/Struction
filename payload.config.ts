import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'YOUR_SECRET_HERE',
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [],
    },
    {
      slug: 'backgrounds',
      admin: {
        useAsTitle: 'sectionId',
        description: 'Edit background effects for each section of the site.',
      },
      fields: [
        { name: 'sectionId', type: 'text', required: true, unique: true },
        {
          name: 'type',
          type: 'select',
          options: ['GradientMesh', 'RetroGrid', 'LavaLamp', 'ParticleNetwork', 'FloatingShapes', 'Waves'],
          required: true,
        },
        { name: 'config', type: 'json', required: true },
      ],
    },
  ],
  editor: lexicalEditor({}),
  db: sqliteAdapter({
    client: {
      url: 'file:./payload.db',
    },
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [],
});
