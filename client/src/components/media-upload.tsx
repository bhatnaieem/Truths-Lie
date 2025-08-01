import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, X, Image, Video, Camera } from "lucide-react";

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  file?: File;
}

interface MediaUploadProps {
  onMediaChange: (media: MediaItem | null) => void;
  currentMedia?: MediaItem | null;
  statementIndex: number;
}

export default function MediaUpload({ onMediaChange, currentMedia, statementIndex }: MediaUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Please select an image or video file');
      return;
    }

    setUploading(true);
    
    try {
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      
      // For videos, we could generate a thumbnail here
      let thumbnail;
      if (type === 'video') {
        thumbnail = await generateVideoThumbnail(file);
      }

      const mediaItem: MediaItem = {
        type,
        url,
        thumbnail,
        file
      };

      onMediaChange(mediaItem);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = 1; // Seek to 1 second
      };
      
      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
          resolve(thumbnail);
        }
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const removeMedia = () => {
    if (currentMedia?.url) {
      URL.revokeObjectURL(currentMedia.url);
    }
    onMediaChange(null);
  };

  if (currentMedia) {
    return (
      <Card className="p-3 relative">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0"
          onClick={removeMedia}
        >
          <X className="h-3 w-3" />
        </Button>
        
        {currentMedia.type === 'image' ? (
          <img
            src={currentMedia.url}
            alt={`Statement ${statementIndex + 1} media`}
            className="w-full h-32 object-cover rounded"
          />
        ) : (
          <div className="relative">
            <video
              src={currentMedia.url}
              className="w-full h-32 object-cover rounded"
              controls={false}
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
              <Video className="h-8 w-8 text-white" />
            </div>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          {currentMedia.type === 'image' ? 'Image' : 'Video'} attached
        </p>
      </Card>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
        dragOver 
          ? 'border-purple-400 bg-purple-50' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
    >
      <div className="space-y-2">
        <div className="flex justify-center">
          <Camera className="h-8 w-8 text-gray-400" />
        </div>
        
        <div>
          <p className="text-sm text-gray-600">
            Add photo or video
          </p>
          <p className="text-xs text-gray-500">
            Drag & drop or click to upload
          </p>
        </div>
        
        <div className="flex gap-2 justify-center">
          <Input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`media-upload-${statementIndex}`}
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(`media-upload-${statementIndex}`)?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Processing...' : 'Choose File'}
          </Button>
        </div>
      </div>
    </div>
  );
}