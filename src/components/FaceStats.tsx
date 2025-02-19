import React from 'react';
import { FaceData } from '../services/faces';
import './FaceStats.css';

interface FaceStatsProps {
  faces: FaceData[];
  onFaceClick: (face: FaceData) => void;
}

export function FaceStats({ faces, onFaceClick }: FaceStatsProps) {
  // Sort by count and take top 20
  const topFaces = faces
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return (
    <div className="face-stats">
      {topFaces.map(face => (
        <div key={face.id} className="face-stat" onClick={() => onFaceClick(face)}>
          <div className="face-thumbnail">
            <img src={face.thumbnailUrl} alt="Face" />
          </div>
          <div className="face-count">{face.count}</div>
        </div>
      ))}
    </div>
  );
} 