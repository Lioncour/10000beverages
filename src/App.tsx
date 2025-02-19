import React, { useEffect, useState } from 'react'
import { fetchImages } from './services/auth'  // We'll need to implement this

interface Image {
  id: string
  url: string
  name: string
}

function App() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadImages() {
      try {
        const fetchedImages = await fetchImages()
        setImages(fetchedImages)
      } catch (error) {
        console.error('Error loading images:', error)
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [])

  if (loading) {
    return <div>Loading beverages...</div>
  }

  return (
    <div>
      <h1>10000 Beverages</h1>
      <div className="image-grid">
        {images.map(image => (
          <div key={image.id} className="image-container">
            <img src={image.url} alt={image.name} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default App 