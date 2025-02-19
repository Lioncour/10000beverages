const isProd = import.meta.env.MODE === 'production';
const REDIRECT_URI = isProd
    ? 'https://10000beverages.no/oauth2callback'
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
    const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType+contains+'image/'&key=${GOOGLE_API_KEY}&fields=files(id,name,webContentLink,thumbnailLink)`;
    
    console.log('Fetching from URL:', url);
    console.log('Using API Key:', GOOGLE_API_KEY?.substring(0, 5) + '...');
    console.log('Using Folder ID:', FOLDER_ID);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response:', response.status, errorText);
      throw new Error(`Failed to fetch images from Google Drive: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Received files:', data.files?.length || 0);
    
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