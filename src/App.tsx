import React, { useEffect, useState, useCallback } from 'react'
import { fetchImages } from './services/auth'  // We'll need to implement this
import './App.css'  // We'll create this file next
import { updateFavicon } from '../public/favicon'

interface Image {
  id: string
  url: string
  name: string
  date: string
  number: number // Position in the grid
}

function App() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)

  useEffect(() => {
    async function loadImages() {
      try {
        const fetchedImages = await fetchImages()
        // Sort by date (newest first) and add number
        const sortedImages = fetchedImages
          .sort((a, b) => {
            // Convert dates from DD.MM.YYYY format to timestamps
            const [dayA, monthA, yearA] = a.date.split('.');
            const [dayB, monthB, yearB] = b.date.split('.');
            const dateA = new Date(Number(yearA), Number(monthA) - 1, Number(dayA));
            const dateB = new Date(Number(yearB), Number(monthB) - 1, Number(dayB));
            return dateB.getTime() - dateA.getTime();
          })
          .map((img, index) => ({
            ...img,
            number: fetchedImages.length - index // Highest number for newest
          }));
        setImages(sortedImages)
        
        // Set the first image as favicon
        if (sortedImages.length > 0) {
          updateFavicon(sortedImages[0].url);
        }
      } catch (error) {
        console.error('Error loading images:', error)
      } finally {
        setLoading(false)
      }
    }
    loadImages()
  }, [])

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!selectedImage) return
    
    const currentIndex = images.findIndex(img => img.id === selectedImage.id)
    if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
      setSelectedImage(images[currentIndex + 1])
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      setSelectedImage(images[currentIndex - 1])
    } else if (e.key === 'Escape') {
      setSelectedImage(null)
    }
  }, [selectedImage, images])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  if (loading) return <div className="loading">Loading beverages...</div>

  return (
    <div className="container">
      <div className="image-grid">
        <div className="counter-container">
          <div className="counter">
            <span className="current">{images.length}</span>
            <span className="total">/10000</span>
            <span className="label">beverages</span>
          </div>
        </div>
        {images.map(image => (
          <div 
            key={image.id} 
            className="image-container"
            onClick={() => setSelectedImage(image)}
          >
            <img src={image.url} alt={image.name} />
            <div className="image-number">#{image.number}</div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={selectedImage.url} alt={selectedImage.name} />
            <div className="modal-info">
              <span className="modal-date">{selectedImage.date}</span>
              <span className="modal-number">#{selectedImage.number}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App 