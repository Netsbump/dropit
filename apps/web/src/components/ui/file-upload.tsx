import { cn } from '@/lib/utils';
import { UploadCloud } from 'lucide-react';
import { InputHTMLAttributes, useState } from 'react';
import { Button } from './button';

interface FileUploadProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  accept?: string;
}

export function FileUpload({ className, accept, ...props }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-lg border border-dashed p-6 border-gray-400',
        dragActive && 'border-primary bg-muted',
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
        <div className="text-sm">
          <label>
            <span className="font-semibold text-primary">
              Cliquez pour upload
            </span>{' '}
            ou glissez-déposez
          </label>
          <p className="text-xs text-muted-foreground">
            MP4, WebM ou OGG (max. 20MB)
          </p>
        </div>
      </div>
      {file && (
        <div className="mt-4 text-sm text-muted-foreground">
          Fichier sélectionné: {file.name}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => setFile(null)}
          >
            Supprimer
          </Button>
        </div>
      )}
      <input
        type="file"
        className="absolute h-full w-full cursor-pointer opacity-0"
        accept={accept}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}
