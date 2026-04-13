import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#f59e0b',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          color: '#000',
          fontWeight: 800,
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '-0.5px',
        }}
      >
        ST
      </div>
    ),
    { ...size },
  );
}
