import { forwardRef } from 'react'

const Image = forwardRef(function Image(
  {
    src,
    alt = '',
    width,
    height,
    fill,
    priority,
    sizes,
    quality,
    unoptimized,
    style,
    ...props
  },
  ref
) {
  const mergedStyle = fill
    ? {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: style?.objectFit || 'cover',
        ...style,
      }
    : style

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      style={mergedStyle}
      {...props}
    />
  )
})

export default Image