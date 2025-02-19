const isProd = import.meta.env.MODE === 'production';
const REDIRECT_URI = isProd
    ? 'https://www.10000beverages.com/oauth2callback'
    : 'http://localhost:5173/oauth2callback'; 

// Google Drive API configuration
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY
const FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

export async function fetchImages(): Promise<Array<{ id: string; url: string; name: string }>> {
  try {
    // Query for image files in the specified folder
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType+contains+'image/'&key=${GOOGLE_API_KEY}&fields=files(id,name,webContentLink,thumbnailLink)`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch images from Google Drive');
    }

    const data = await response.json();
    
    // Transform the response data into the format our app expects
    return data.files.map((file: DriveFile) => ({
      id: file.id,
      name: file.name,
      url: `https://drive.google.com/uc?export=view&id=${file.id}`,
    }));
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
} 