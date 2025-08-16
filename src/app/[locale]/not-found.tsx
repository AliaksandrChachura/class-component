import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          width: '100%',
          color: '#2c3e50',
        }}
      >
        <h1
          style={{
            fontSize: '6rem',
            margin: '0',
            color: '#e74c3c',
            textAlign: 'center',
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: '2rem',
            margin: '20px 0',
            color: '#2c3e50',
            textAlign: 'center',
          }}
        >
          Page Not Found
        </h2>
        <p
          style={{
            fontSize: '1.2rem',
            margin: '10px 0',
            color: '#34495e',
            textAlign: 'center',
          }}
        >
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <p
          style={{
            fontSize: '1rem',
            margin: '20px 0',
            color: '#7f8c8d',
            maxWidth: '500px',
            textAlign: 'center',
            lineHeight: '1.6',
          }}
        >
          The page you requested could not be found. It might have been moved,
          deleted, or you entered the wrong URL.
        </p>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link
            href="/en"
            style={{
              padding: '12px 24px',
              margin: '0 10px',
              border: 'none',
              borderRadius: '25px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            🏠 Go Home
          </Link>
          <Link
            href="/en/about"
            style={{
              padding: '12px 24px',
              margin: '0 10px',
              border: '2px solid #bdc3c7',
              borderRadius: '25px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: '#ecf0f1',
              color: '#2c3e50',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            ℹ️ About Page
          </Link>
        </div>
      </div>
    </div>
  );
}
