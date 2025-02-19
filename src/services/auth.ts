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
    console.log('Environment variables check:');
    console.log('Environment mode:', import.meta.env.MODE);
    console.log('API Key length:', GOOGLE_API_KEY?.length || 0);
    console.log('Folder ID length:', FOLDER_ID?.length || 0);

    if (!GOOGLE_API_KEY || !FOLDER_ID) {
      throw new Error(`Missing API key or folder ID. API Key: ${!!GOOGLE_API_KEY}, Folder ID: ${!!FOLDER_ID}`);
    }

    const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType+contains+'image/'&key=${GOOGLE_API_KEY}&fields=files(id,name,webContentLink,thumbnailLink)`;
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response:', response.status, errorText);
      throw new Error(`Failed to fetch images from Google Drive: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Received files:', data.files?.length || 0);
    
    // Log more details about the first few files
    if (data.files?.length > 0) {
      console.log('First 3 files data:', data.files.slice(0, 3));
    }

    return data.files.map((file: DriveFile) => {
      const imageUrl = file.thumbnailLink || 
                      `https://drive.google.com/thumbnail?id=${file.id}` ||
                      `https://drive.google.com/uc?export=view&id=${file.id}`;
      
      console.log(`Image ${file.name} URL:`, imageUrl);
      
      return {
        id: file.id,
        name: file.name,
        url: imageUrl
      };
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
} 