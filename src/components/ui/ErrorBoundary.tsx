import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    // Pulisci localStorage per risolvere conflitti dati legacy
    localStorage.clear();
    window.location.href = '/welcome';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <AlertTriangle size={64} style={{ marginBottom: '1.5rem', color: '#dc2626' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Ops! Qualcosa è andato storto.
          </h1>
          <p style={{ maxWidth: '500px', marginBottom: '2rem', lineHeight: '1.5', color: '#7f1d1d' }}>
            L'applicazione ha riscontrato un errore imprevisto. 
            Questo accade spesso a causa di dati obsoleti nel browser dopo un aggiornamento.
          </p>

          <div style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            width: '100%',
            maxWidth: '600px',
            overflow: 'auto',
            textAlign: 'left',
            marginBottom: '2rem'
          }}>
            <code style={{ fontSize: '0.85rem', color: '#b91c1c' }}>
              {this.state.error?.toString()}
            </code>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              onClick={this.handleReload}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={18} /> RIPROVA
            </button>
            <button 
              onClick={this.handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'white',
                color: '#dc2626',
                border: '1px solid #dc2626',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={18} /> RESET APP & CACHE
            </button>
          </div>
          
          <p style={{ marginTop: '2rem', fontSize: '0.85rem', opacity: 0.7 }}>
            Il reset risolverà il problema cancellando i dati locali incompatibili.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
