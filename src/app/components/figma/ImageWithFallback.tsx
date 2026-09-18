import React, { useState } from 'react'

const DEFAULT_FALLBACK_IMG =
  'https://images.unsplash.com/photo-1758995115560-59c10d6cc28f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  React.useEffect(() => {
    setDidError(false)
  }, [props.src])

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props

  const backendHost = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  let finalSrc = src || DEFAULT_FALLBACK_IMG;
  if (typeof finalSrc === 'string') {
    if (backendHost && finalSrc.startsWith('/static/')) {
      finalSrc = `${backendHost}${finalSrc}`;
    } else if (finalSrc.startsWith('http://localhost:8000') && !backendHost) {
      finalSrc = finalSrc.replace('http://localhost:8000', '');
    }
  }

  return didError ? (
    <img
      src={DEFAULT_FALLBACK_IMG}
      alt={alt || "Product image"}
      className={className}
      style={style}
      {...rest}
    />
  ) : (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
    />
  )
}
