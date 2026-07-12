import { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';
import { getPublicUrl } from '../lib/storage';

interface SmartImageProps {
  path: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}

export default function SmartImage({ path, alt, className = '', imgClassName = '' }: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setLoaded(false);
    setError(false);
    setUrl(getPublicUrl(path));
  }, [path]);

  if (!path || error) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 ${className} ${imgClassName}`}>
        <ImageOff size={24} className="text-slate-400" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!loaded && (
        <div className={`absolute inset-0 flex items-center justify-center bg-slate-100 ${imgClassName}`}>
          <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={url}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${imgClassName} ${loaded ? '' : 'opacity-0'}`}
      />
    </div>
  );
}
