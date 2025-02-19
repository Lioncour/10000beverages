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
    if (!GOOGLE_API_KEY || !FOLDER_ID) {
      throw new Error(`Missing API key or folder ID`);
    }

    let allFiles: DriveFile[] = [];
    let pageToken: string | undefined;

    do {
      const pageQuery = pageToken ? `&pageToken=${pageToken}` : '';
      const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType+contains+'image/'&key=${GOOGLE_API_KEY}&fields=nextPageToken,files(id,name,webContentLink,thumbnailLink,webViewLink)&pageSize=1000${pageQuery}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response:', response.status, errorText);
        throw new Error(`Failed to fetch images from Google Drive: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      allFiles = [...allFiles, ...data.files];
      pageToken = data.nextPageToken;

      console.log(`Loaded ${allFiles.length} files so far...`);
    } while (pageToken);

    console.log(`Total files loaded: ${allFiles.length}`);

    return allFiles.map((file: DriveFile) => {
      const imageUrl = 
        file.webContentLink || 
        file.thumbnailLink?.replace('=s220', '=s2000') || // Much larger thumbnails
        `https://drive.google.com/uc?id=${file.id}&export=download`;
      
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