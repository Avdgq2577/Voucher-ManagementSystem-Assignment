import { useState, useRef, useEffect } from 'react';
import { PenTool, Upload, RotateCcw, Check } from 'lucide-react';
import api from '../services/api';

export const SignaturePad = ({ value, onChange, label = 'Signature' }) => {
  const [mode, setMode] = useState('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#1e293b';
    }
  }, [mode]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onChange('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('signature', file);

    try {
      setUploading(true);
      const res = await api.post('/vouchers/upload-signature', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onChange(res.data.url);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload signature image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label className="form-label required">{label}</label>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'draw' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('draw')}
          >
            <PenTool size={14} />
            <span>Draw</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('upload')}
          >
            <Upload size={14} />
            <span>Upload</span>
          </button>
        </div>
      </div>

      <div className="signature-box">
        {mode === 'draw' && (
          <div>
            <canvas
              ref={canvasRef}
              width={420}
              height={140}
              className="signature-canvas"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Draw your signature using mouse or finger above</span>
              <button type="button" onClick={handleClear} className="btn btn-secondary btn-sm">
                <RotateCcw size={14} />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}

        {mode === 'upload' && (
          <div style={{ padding: '1rem' }}>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileUpload}
              disabled={uploading}
              className="form-input"
            />
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {uploading ? 'Uploading image...' : 'Accepted formats: PNG, JPG, WEBP (Max 5MB)'}
            </div>
          </div>
        )}

        {value && (
          <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--success)', fontSize: '0.8125rem', fontWeight: 600 }}>
              <Check size={16} />
              <span>Signature Captured</span>
            </div>
            <img src={value} alt="Captured Signature" className="signature-preview" />
          </div>
        )}
      </div>
    </div>
  );
};
