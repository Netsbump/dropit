import { cn } from '@/lib/utils';
import { UploadCloud } from 'lucide-react';
import {
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
  type Ref,
  useRef,
  useState,
} from 'react';
import { Button } from './button';

interface FileUploadProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  accept?: string;
  ref?: Ref<HTMLInputElement>;
}

export const FileUpload = ({
  className,
  accept,
  onChange,
  ref,
  ...props
}: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleInputRef = (node: HTMLInputElement | null) => {
    inputRef.current = node;

    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
      // Propager le changement à react-hook-form
      onChange?.(e as unknown as ChangeEvent<HTMLInputElement>);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      // Propager le changement à react-hook-form
      onChange?.(e);
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
            onClick={() => {
              setFile(null);
              // Réinitialiser la valeur pour react-hook-form
              if (inputRef.current) {
                inputRef.current.value = '';
              }
              onChange?.({
                target: { value: '' },
              } as ChangeEvent<HTMLInputElement>);
            }}
          >
            Supprimer
          </Button>
        </div>
      )}
      <input
        type="file"
        ref={handleInputRef}
        className="absolute h-full w-full cursor-pointer opacity-0"
        accept={accept}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
};

FileUpload.displayName = 'FileUpload';
