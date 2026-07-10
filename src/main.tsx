import { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import App from './App';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:'Kanit,sans-serif', gap:'1rem', padding:'2rem', textAlign:'center' }}>
          <p style={{ fontSize:'1.1rem', color:'#555' }}>เกิดข้อผิดพลาด กรุณารีเฟรชหน้าจออีกครั้ง</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
            style={{ padding:'.6rem 1.8rem', background:'#2d6a4f', color:'#fff', border:'none', borderRadius:'8px', fontSize:'1rem', cursor:'pointer', fontFamily:'Kanit,sans-serif' }}
          >
            กลับหน้าหลัก
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
