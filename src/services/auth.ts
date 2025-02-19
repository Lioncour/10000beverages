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
      // Add pageSize=50 to limit results
      const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType+contains+'image/'&key=${GOOGLE_API_KEY}&fields=nextPageToken,files(id,name,webContentLink,thumbnailLink,webViewLink,mimeType,createdTime,modifiedTime)&pageSize=50${pageQuery}`;
      
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

      // Only get first page
      break;  // Stop after first 50 images
    } while (pageToken);

    console.log(`Total files loaded: ${allFiles.length}`);

    return allFiles.map((file: DriveFile) => {
      // Use direct download URL instead of thumbnail
      const imageUrl = `https://drive.google.com/uc?export=view&id=${file.id}`;
      
      // Log the URL for debugging
      console.log('Image URL:', imageUrl);
      
      // Try to extract date from filename first (assuming format YYYYMMDD_HHMMSS)
      let date = '';
      const dateMatch = file.name.match(/^(\d{8})_/);
      if (dateMatch) {
        const dateStr = dateMatch[1];
        date = `${dateStr.slice(6, 8)}.${dateStr.slice(4, 6)}.${dateStr.slice(0, 4)}`;
      } else {
        // Fall back to modified time, then created time
        const timeStamp = file.modifiedTime || file.createdTime;
        if (timeStamp) {
          date = new Date(timeStamp).toLocaleDateString('no-NO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        }
      }
      
      return {
        id: file.id,
        name: file.name,
        url: imageUrl,
        date: date
      };
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}