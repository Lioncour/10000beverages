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

      // Log sample of URLs we're getting
      if (data.files?.length > 0) {
        console.log('Sample file:', {
          name: data.files[0].name,
          webContentLink: data.files[0].webContentLink,
          thumbnailLink: data.files[0].thumbnailLink,
          webViewLink: data.files[0].webViewLink,
          mimeType: data.files[0].mimeType
        });
      }

      console.log(`Loaded ${allFiles.length} files so far...`);

      // Only get first page
      break;  // Add this to stop after first 50 images
    } while (pageToken);

    console.log(`