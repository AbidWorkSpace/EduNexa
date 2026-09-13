'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import { getResolvedImageSrc } from 'src/utils/resolve-image-url';
import { isTenantS3ObjectKey } from 'src/utils/tenant-s3-object-key';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Reusable S3 Image Preview Component
 *
 * Handles URLs and paths:
 * - http(s) URLs are used as-is
 * - Raw S3 object keys (`items/`, `staff/`, etc.) are not browser-displayable without a signed/public URL; shows placeholder (pass a full URL from the API when available)
 * - Other relative paths use `getResolvedImageSrc`
 * - Shows placeholder if there is no displayable URL or the image fails to load
 * - Fully reusable across the application
 *
 * @param {Object} props
 * @param {string|null|undefined} props.imageUrl - S3 objectKey or image URL
 * @param {string} [props.alt] - Alt text for image (default: 'Image')
 * @param {string|number} [props.width] - Image width (default: '100%')
 * @param {string|number} [props.height] - Image height (default: 'auto')
 * @param {string} [props.ratio] - Aspect ratio (e.g., '16/9', '1/1')
 * @param {boolean} [props.showPlaceholder] - Show placeholder when no image (default: true)
 * @param {string} [props.placeholderIcon] - Iconify icon when no image (default: mdi:image-broken)
 * @param {number} [props.placeholderIconSize] - Placeholder icon size in px (default: 40)
 * @param {Object} [props.sx] - Additional MUI sx styles
 * @param {Object} [props.slotProps] - Slot props for customization
 * @param {Object} [props.slotProps.image] - Props for img element
 * @param {Object} [props.slotProps.placeholder] - Props for placeholder Box
 */
export function ImagePreview({
  imageUrl,
  alt = 'Image',
  width = '100%',
  height = 'auto',
  ratio,
  showPlaceholder = true,
  placeholderIcon = 'mdi:image-broken',
  placeholderIconSize = 40,
  sx,
  slotProps,
  ...other
}) {
  const [displayUrl, setDisplayUrl] = useState(null);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef(null);

  const isS3ObjectKey = imageUrl && typeof imageUrl === 'string' && isTenantS3ObjectKey(imageUrl);

  // Resolve display URL (no network: object keys need a full URL from the caller/API)
  useEffect(() => {
    if (!imageUrl) {
      setDisplayUrl(null);
      setHasError(false);
      return () => {};
    }

    if (typeof imageUrl === 'string' && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      setDisplayUrl(imageUrl);
      setHasError(false);
      return () => {};
    }

    if (isS3ObjectKey) {
      setDisplayUrl(null);
      setHasError(false);
      return () => {};
    }

    const resolved = getResolvedImageSrc(imageUrl);
    setDisplayUrl(resolved);
    setHasError(!resolved);
    return () => {};
  }, [imageUrl, isS3ObjectKey]);

  // Handle image load error
  const handleImageError = () => {
    setHasError(true);
  };

  // Render placeholder when no image or error
  if (!displayUrl || hasError) {
    if (!showPlaceholder) return null;

    const { sx: placeholderSlotSx, ...placeholderSlotRest } = slotProps?.placeholder ?? {};

    return (
      <Box
        sx={[
          {
            width,
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.neutral',
            borderRadius: 1,
            ...(ratio && {
              aspectRatio: ratio,
              height: 'auto',
            }),
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
          ...(Array.isArray(placeholderSlotSx)
            ? placeholderSlotSx
            : placeholderSlotSx
              ? [placeholderSlotSx]
              : []),
        ]}
        {...placeholderSlotRest}
        {...other}
      >
        <Iconify
          icon={placeholderIcon}
          width={placeholderIconSize}
          sx={{ color: 'text.disabled', opacity: 0.72 }}
        />
      </Box>
    );
  }

  // Render image
  return (
    <Box
      component="img"
      ref={imageRef}
      src={displayUrl}
      alt={alt}
      onError={handleImageError}
      sx={[
        {
          width,
          height,
          objectFit: 'cover',
          borderRadius: 1,
          display: 'block',
          ...(ratio && {
            aspectRatio: ratio,
            height: 'auto',
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...slotProps?.image}
      {...other}
    />
  );
}

