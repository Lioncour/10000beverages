import React from 'react';
import { FaceData } from '../services/faces';
import './FaceStats.css';

interface FaceStatsProps {
  faces: FaceData[];
}

export function FaceStats({ faces }: FaceStatsProps) {
  return (
    <div className="face-stats">
      {faces.map(face => (
        <div key={face.id} className="face-stat">
          <div className="face-thumbnail">
            <img src={face.thumbnailUrl} alt="Face" />
          </div>
          <div className="face-count">{face.count}</div>
        </div>
      ))}
    </div>
  );
} 