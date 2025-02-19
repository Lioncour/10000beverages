interface FaceData {
  id: string;  // Unique identifier for the face
  imageUrls: string[];  // URLs of images containing this face
  thumbnailUrl: string;  // Representative image for this face
  count: number;  // Number of appearances
}

export async function detectFaces(imageUrl: string): Promise<any> {
  const visionApiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
  
  try {
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [{
          image: { source: { imageUri: imageUrl } },
          features: [{ type: 'FACE_DETECTION' }]
        }]
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error detecting faces:', error);
    return null;
  }
}

export async function processFaces(images: Array<{ url: string; id: string }>): Promise<FaceData[]> {
  const faceMap = new Map<string, FaceData>();
  
  console.log('Starting face detection for', images.length, 'images');
  
  for (const image of images) {
    console.log('Processing image:', image.url);
    const faces = await detectFaces(image.url);
    console.log('Detected faces:', faces?.responses?.[0]?.faceAnnotations?.length || 0);
    
    if (faces?.responses?.[0]?.faceAnnotations) {
      faces.responses[0].faceAnnotations.forEach((face: any) => {
        // Use face landmarks to create a unique identifier
        const faceId = generateFaceId(face);
        
        if (faceMap.has(faceId)) {
          const data = faceMap.get(faceId)!;
          data.imageUrls.push(image.url);
          data.count++;
        } else {
          faceMap.set(faceId, {
            id: faceId,
            imageUrls: [image.url],
            thumbnailUrl: image.url,
            count: 1
          });
        }
      });
    }
  }
  
  const results = Array.from(faceMap.values());
  console.log('Total unique faces found:', results.length);
  return results;
}

function generateFaceId(face: any): string {
  try {
    // Get more precise facial features
    const features = [
      face.joyLikelihood,
      face.sorrowLikelihood,
      face.angerLikelihood,
      face.surpriseLikelihood,
      face.underExposedLikelihood,
      face.blurredLikelihood,
      face.headwearLikelihood
    ];

    // Get key facial landmarks
    const keyLandmarks = [
      'LEFT_EYE',
      'RIGHT_EYE',
      'LEFT_OF_LEFT_EYEBROW',
      'RIGHT_OF_LEFT_EYEBROW',
      'LEFT_OF_RIGHT_EYEBROW',
      'RIGHT_OF_RIGHT_EYEBROW',
      'MIDPOINT_BETWEEN_EYES',
      'NOSE_TIP',
      'UPPER_LIP',
      'LOWER_LIP',
      'MOUTH_LEFT',
      'MOUTH_RIGHT',
      'MOUTH_CENTER',
      'NOSE_BOTTOM_RIGHT',
      'NOSE_BOTTOM_LEFT',
      'NOSE_BOTTOM_CENTER',
      'LEFT_EYE_TOP_BOUNDARY',
      'LEFT_EYE_RIGHT_CORNER',
      'LEFT_EYE_BOTTOM_BOUNDARY',
      'LEFT_EYE_LEFT_CORNER',
      'RIGHT_EYE_TOP_BOUNDARY',
      'RIGHT_EYE_RIGHT_CORNER',
      'RIGHT_EYE_BOTTOM_BOUNDARY',
      'RIGHT_EYE_LEFT_CORNER'
    ];

    const landmarks = face.landmarks || [];
    const positions = landmarks
      .filter((l: any) => keyLandmarks.includes(l.type))
      .map((l: any) => `${l.position.x.toFixed(2)},${l.position.y.toFixed(2)}`);

    // Combine features and landmarks
    return [...features, ...positions].join('|');
  } catch (error) {
    console.error('Error generating face ID:', error);
    return Math.random().toString(); // Fallback
  }
} 