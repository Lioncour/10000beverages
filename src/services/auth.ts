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
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export async function fetchImages(): Promise<Array<{ id: string; url: string; name: string; date: string }>> {
  try {
    if (!GOOGLE_API_KEY || !FOLDER_ID) {
      throw new Error(`Missing API key or folder ID`);
    }

    let allFiles: DriveFile[] = [];
    let pageToken: string | undefined;

    do {
      const pageQuery = pageToken ? `&pageToken=${pageToken}` : '';
      // Updated URL to request all needed fields
      const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType+contains+'image/'&key=${GOOGLE_API_KEY}&fields=nextPageToken,files(id,name,createdTime,webContentLink,thumbnailLink)&pageSize=50${pageQuery}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.status}`);
      }

      const data = await response.json();
      
      // Log the raw response
      console.log('API Response:', data);
      
      allFiles = [...allFiles, ...data.files];
      pageToken = data.nextPageToken;

      // Only get first page
      break;
    } while (pageToken);

    return allFiles.map((file: DriveFile) => {
      // Try thumbnailLink first, then fall back to direct URL
      const imageUrl = file.thumbnailLink?.replace('=s220', '=s2000') || 
                      `https://drive.google.com/uc?export=download&id=${file.id}`;
      
      console.log('Processing file:', {
        name: file.name,
        thumbnailLink: file.thumbnailLink,
        finalUrl: imageUrl
      });

      // Extract date from filename
      let date = '';
      const dateMatch = file.name.match(/^(\d{8})_/);
      if (dateMatch) {
        const dateStr = dateMatch[1];
        date = `${dateStr.slice(6, 8)}.${dateStr.slice(4, 6)}.${dateStr.slice(0, 4)}`;
      } else if (file.createdTime) {
        date = new Date(file.createdTime).toLocaleDateString('no-NO', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }

      return {
        id: file.id,
        name: file.name,
        url: imageUrl,
        date: date
      };
    });
  } catch (error) {
    console.error('Error in fetchImages:', error);
    return [];
  }
}