import React from 'react';
import { ShieldCheck, Lock, Database, KeyRound, UserCheck } from 'lucide-react';
import { Card } from '../components/ui';

const TrustCenter = () => {
  return (
    <div className="trust-center-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem 0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.12)',
            color: 'var(--success)',
            fontWeight: 700,
            fontSize: '0.8125rem',
            marginBottom: '1rem'
          }}
        >
          <ShieldCheck size={16} /> Privacy-First & Zero AI Model Training
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>
          Security, Privacy & Truth Center
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
          We believe candidate career documents represent sensitive personal data. Here is our transparent architecture and strict privacy commitment.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {/* Pillar 1: Zero AI Model Training */}
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
              <Lock size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700 }}>Zero Model Training</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Your resume content, career history, and job descriptions are <strong>never</strong> used to train public foundation models or shared with third-party data brokers.
          </p>
        </Card>

        {/* Pillar 2: Truth Ledger Integrity */}
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.15)', color: 'var(--accent-primary)' }}>
              <UserCheck size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700 }}>Zero Hallucinations</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Our Evidence Coach and tailored document generation strictly require factual user provenance. We never fabricate percentages, revenue metrics, or fake credentials.
          </p>
        </Card>

        {/* Pillar 3: Cryptographic Sharing */}
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
              <KeyRound size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700 }}>Cryptographic Share Links</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Public links use 192-bit cryptographic tokens with optional password protection, custom expiration windows, and contact info masking.
          </p>
        </Card>

        {/* Pillar 4: GDPR Rights */}
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Database size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700 }}>GDPR Art. 17 & 20</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            You maintain 100% data sovereignty. Export your entire machine-readable JSON archive at any time, or permanently purge all account records in 1-click.
          </p>
        </Card>
      </div>

      {/* Technical Security Table */}
      <div style={{ padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
          Technical Privacy & Safety Architecture
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <strong>Data Storage:</strong>
            <span style={{ color: 'var(--text-secondary)' }}>MongoDB with AES-256 encryption at rest and strict per-user tenant document isolation.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <strong>In-Transit Encryption:</strong>
            <span style={{ color: 'var(--text-secondary)' }}>TLS 1.3 encryption for all client-to-server and server-to-database communications.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <strong>AI Privacy Filter:</strong>
            <span style={{ color: 'var(--text-secondary)' }}>Automated regex scrubber strips JWT tokens, database IDs, passwords, and sensitive credentials before any optional AI dispatch.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem' }}>
            <strong>Offline Operation:</strong>
            <span style={{ color: 'var(--text-secondary)' }}>Deterministic local NLP rule-based engine activates automatically if external AI is disabled or offline, keeping the editor 100% functional.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustCenter;
