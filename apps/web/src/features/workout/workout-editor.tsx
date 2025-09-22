import { api } from '@/lib/api';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';
import { WORKOUT_ELEMENT_TYPES, WorkoutDto } from '@dropit/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useState } from 'react';

interface WorkoutEditorProps {
  workout: WorkoutDto;
  onCancel: () => void;
}

export function WorkoutEditor({
  workout: initialWorkout,
  onCancel,
}: WorkoutEditorProps) {
  const [workout, setWorkout] = useState(initialWorkout);
  const queryClient = useQueryClient();

  const { mutate: updateWorkout, isPending } = useMutation({
    mutationFn: async () => {
      const response = await api.workout.updateWorkout({
        params: { id: workout.id },
        body: workout,
      });
      if (response.status !== 200) throw new Error('Failed to update workout');
      return response.body;
    },
    onSuccess: (updatedWorkout) => {
      queryClient.setQueryData(['workout', workout.id], updatedWorkout);
      onCancel();
    },
  });

  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await api.exercise.getExercises();
      if (response.status !== 200) throw new Error('Failed to load exercises');
      return response.body;
    },
  });

  const { data: complexes } = useQuery({
    queryKey: ['complexes'],
    queryFn: async () => {
      const response = await api.complex.getComplexes();
      if (response.status !== 200) throw new Error('Failed to load complexes');
      return response.body;
    },
  });

  const { data: workoutCategories } = useQuery({
    queryKey: ['workoutCategories'],
    queryFn: async () => {
      const response = await api.workoutCategory.getWorkoutCategories();
      if (response.status !== 200) throw new Error('Failed to load categories');
      return response.body;
    },
  });

  const handleElementDelete = (elementId: string) => {
    setWorkout({
      ...workout,
      elements: workout.elements.filter((el) => el.id !== elementId),
    });
  };

  const handleAddElement = (type: 'exercise' | 'complex', itemId: string) => {
    const baseElement = {
      id: crypto.randomUUID(),
      order: workout.elements.length,
      sets: 1,
      reps: 1,
      rest: 60,
      startWeight_percent: 70,
    };

    if (type === 'exercise') {
      const exercise = exercises?.find((e) => e.id === itemId);
      if (!exercise) return;

      const newElement = {
        ...baseElement,
        type: WORKOUT_ELEMENT_TYPES.EXERCISE,
        exercise,
      };

      setWorkout({
        ...workout,
        elements: [...workout.elements, newElement],
      });
    } else {
      const complex = complexes?.find((c) => c.id === itemId);
      if (!complex) return;

      const newElement = {
        ...baseElement,
        type: WORKOUT_ELEMENT_TYPES.COMPLEX,
        complex,
      };

      setWorkout({
        ...workout,
        elements: [...workout.elements, newElement],
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center h-14 gap-4 px-4">
          <Button variant="outline" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Input
              value={workout.title}
              onChange={(e) =>
                setWorkout({ ...workout, title: e.target.value })
              }
              className="h-9 font-semibold"
            />
          </div>
          <div className="flex gap-2">
            <Button>Programmer</Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="h-full grid grid-cols-6 divide-x">
          {/* Left Column - Info */}
          <div className="col-span-1 py-6 pr-6 space-y-4">
            <h2 className="text-lg font-semibold">Informations</h2>

            {/* Catégorie */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-md font-medium text-muted-foreground mb-2">
                  Catégorie
                </h3>
                <Select
                  value={workout.workoutCategory}
                  onValueChange={(value) =>
                    setWorkout({ ...workout, workoutCategory: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workoutCategories?.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-md font-medium text-muted-foreground mb-2">
                  Description
                </h3>
                <Textarea
                  value={workout.description || ''}
                  onChange={(e) =>
                    setWorkout({ ...workout, description: e.target.value })
                  }
                  placeholder="Ajouter une description..."
                  className="resize-none"
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Elements */}
          <div className="col-span-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Éléments</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un élément
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un élément</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="exercise">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="exercise">Exercice</TabsTrigger>
                      <TabsTrigger value="complex">Complex</TabsTrigger>
                    </TabsList>
                    <TabsContent value="exercise" className="space-y-2">
                      {exercises?.map((exercise) => (
                        <Button
                          key={exercise.id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() =>
                            handleAddElement('exercise', exercise.id)
                          }
                        >
                          {exercise.name}
                        </Button>
                      ))}
                    </TabsContent>
                    <TabsContent value="complex" className="space-y-2">
                      {complexes?.map((complex) => (
                        <Button
                          key={complex.id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() =>
                            handleAddElement('complex', complex.id)
                          }
                        >
                          {complex.complexCategory?.name || 'Complex'}
                        </Button>
                      ))}
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div
                  className="grid grid-cols-2 gap-4"
                  style={{ gridAutoFlow: 'dense' }}
                >
                  {workout.elements.map((element, index) => (
                    <div
                      key={element.id}
                      className="bg-muted/30 rounded-lg p-4 space-y-2 relative group"
                      style={{
                        gridColumnStart: index % 2 === 0 ? 1 : 2,
                        gridRow: `span ${
                          element.type === WORKOUT_ELEMENT_TYPES.COMPLEX ? 2 : 1
                        }`,
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleElementDelete(element.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {element.type === WORKOUT_ELEMENT_TYPES.EXERCISE ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {element.sets} séries
                            </Badge>
                            <span className="font-medium">
                              {element.exercise.name}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Poids initial: {element.startWeight_percent}%
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {element.sets} séries
                            </Badge>
                            <span className="font-medium">
                              {element.complex.complexCategory?.name || 'Complex'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Poids initial: {element.startWeight_percent}%
                          </p>
                          <div className="space-y-2 ml-6">
                            {element.complex.exercises.map((ex) => (
                              <div
                                key={ex.id}
                                className="flex items-center gap-2 bg-muted/50 rounded-md p-2"
                              >
                                <Badge
                                  variant="outline"
                                  className="bg-background"
                                >
                                  {ex.reps}
                                </Badge>
                                <span className="text-sm">{ex.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="col-span-1 py-6 pl-6 space-y-4">
            <h2 className="text-lg font-semibold">Actions</h2>
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <h3 className="text-md font-medium text-muted-foreground mb-2">
                    Mode édition
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    Modifiez les informations et les éléments de l'entraînement
                  </div>
                </div>
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => updateWorkout()}
                    disabled={isPending}
                  >
                    {isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={onCancel}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
