import { api } from '@/lib/api';
import { CreateExercise } from '@dropit/schemas';
import { useState } from 'react';
import { Button } from '../ui/button';
import { FileUpload } from '../ui/file-upload';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';

interface ExerciseCreationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ExerciseCreationForm({
  onSuccess,
  onCancel,
}: ExerciseCreationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateExercise>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.createExercise({
        body: {
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          name: formData.name!,
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          exerciseCategory: formData.exerciseCategory!,
          description: formData.description,
          englishName: formData.englishName,
          shortName: formData.shortName,
          // La gestion de la vidéo nécessitera probablement une route séparée pour l'upload
        },
      });

      if (response.status === 201) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof CreateExercise, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          placeholder="Nom de l'exercice"
          value={formData.name ?? ''}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="category">Catégorie</Label>
        <Select
          value={formData.exerciseCategory}
          onValueChange={(value) => handleChange('exerciseCategory', value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="halterophilie">Haltérophilie</SelectItem>
            <SelectItem value="musculation">Musculation</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Description de l'exercice"
          value={formData.description ?? ''}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="englishName">Nom en anglais</Label>
        <Input
          id="englishName"
          placeholder="Nom en anglais"
          value={formData.englishName ?? ''}
          onChange={(e) => handleChange('englishName', e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="shortName">Abbréviation</Label>
        <Input
          id="shortName"
          placeholder="Abbréviation"
          value={formData.shortName ?? ''}
          onChange={(e) => handleChange('shortName', e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="video">Vidéo</Label>
        <FileUpload
          id="video"
          accept="video/mp4,video/webm,video/ogg"
          aria-label="Upload une vidéo"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Création...' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}
