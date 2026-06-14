import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Relique - Relics you can rely on';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: 180,
              fontFamily: 'serif',
              color: '#fff',
              fontWeight: 400,
            }}
          >
            R
          </div>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: '#fff',
              marginTop: '-80px',
            }}
          />
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 48,
            color: '#fff',
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          Relique
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 400,
          }}
        >
          Relics you can rely on
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
