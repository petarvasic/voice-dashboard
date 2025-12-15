// pages/index.js
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>VOICE Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fbfbfd',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '700',
            color: '#1d1d1f',
            marginBottom: '16px',
            letterSpacing: '-1px'
          }}>
            VOICE
          </h1>
          <p style={{ 
            fontSize: '19px', 
            color: '#86868b',
            marginBottom: '32px'
          }}>
            Client Campaign Dashboard
          </p>
          <p style={{ fontSize: '14px', color: '#86868b' }}>
            Pristupite vašem dashboardu putem linka koji ste dobili.
          </p>
        </div>
      </div>
    </>
  );
}
