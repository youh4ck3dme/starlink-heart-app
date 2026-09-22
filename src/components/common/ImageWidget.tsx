import React from 'react';

interface ImageWidgetProps {
  imageUrl: string;
  title?: string;
  sourceUrl?: string;
  sourceName?: string;
  alt?: string;
}

/**
 * ImageWidget — displays external images with source attribution
 * Useful for displaying reference images from iStockPhoto, Unsplash, etc.
 */
export default function ImageWidget({
  imageUrl,
  title = 'Referenčný obrázok',
  sourceUrl,
  sourceName = 'iStockPhoto',
  alt = 'Reference image'
}: ImageWidgetProps) {
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-sky-200 bg-sky-50 shadow-md hover:shadow-lg transition-shadow">
      {/* Image Container */}
      <div className="relative bg-white overflow-hidden">
        <img 
          src={imageUrl} 
          alt={alt}
          className="w-full h-auto object-cover max-h-96"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e0e7ff" width="400" height="300"/%3E%3Ctext x="200" y="150" font-size="16" fill="%234f46e5" text-anchor="middle" dominant-baseline="middle"%3ENemôžem načítať obrázok%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>

      {/* Metadata Footer */}
      <div className="p-3 bg-gradient-to-r from-sky-50 to-indigo-50 border-t border-sky-200">
        <div className="text-xs font-bold text-sky-700 uppercase tracking-wider mb-2">
          📸 {title}
        </div>
        
        {sourceUrl ? (
          <a 
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 font-medium transition-colors break-all"
            title="Otvoriť na iStockPhoto"
          >
            🔗 {sourceName}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ) : (
          <div className="text-xs text-sky-600 font-medium">
            📸 {sourceName}
          </div>
        )}

        {sourceUrl && (
          <div className="text-[10px] text-sky-500 mt-2 font-mono break-all line-clamp-2">
            {sourceUrl}
          </div>
        )}
      </div>
    </div>
  );
}
