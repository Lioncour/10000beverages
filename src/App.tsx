import React, { useEffect, useState, useCallback } from 'react'
import { fetchImages } from './services/auth'  // We'll need to implement this
import './App.css'  // We'll create this file next

interface Image {
  id: string
  url: string
  name: string
  date?: string // Add date if available from Google Drive
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
        // Add number to each image
        const numberedImages = fetchedImages.map((img, index) => ({
          ...img,
          number: index + 1,
          date: new Date().toLocaleDateString() // Replace with actual date from metadata
        }))
        setImages(numberedImages)
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
      <h1>10000 Beverages</h1>
      <div className="image-grid">
        {images.map(image => (
          <div 
            key={image.id} 
            className="image-container"
            onClick={() => setSelectedImage(image)}
          >
            <img src={image.url} alt={image.name} />
            <div className="image-info">
              <span className="image-date">{image.date}</span>
              <span className="image-number">#{image.number}</span>
            </div>
            <div className="image-name">{image.name}</div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={selectedImage.url} alt={selectedImage.name} />
            <div className="modal-info">
              <span className="modal-date">{selectedImage.date}</span>
              <span className="modal-name">{selectedImage.name}</span>
              <span className="modal-number">#{selectedImage.number}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App 