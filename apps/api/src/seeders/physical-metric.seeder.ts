import { EntityManager } from '@mikro-orm/core';
import { Athlete } from '../entities/athlete.entity';
import { PhysicalMetric } from '../entities/physical-metric.entity';

export async function seedPhysicalMetrics(em: EntityManager): Promise<void> {
  console.log('Seeding physical metrics...');

  // Récupérer les mêmes 5 athlètes
  const athletes = await em.find(Athlete, {}, { limit: 5 });

  for (const athlete of athletes) {
    // Créer 3 mesures physiques par athlète sur les 6 derniers mois
    for (let i = 0; i < 3; i++) {
      const metric = new PhysicalMetric();
      metric.athlete = athlete;
      
      // Poids entre 50 et 100kg
      metric.weight = Math.floor(Math.random() * (100 - 50) + 50);
      // Taille entre 1.60m et 1.90m
      metric.height = Number((Math.random() * (1.90 - 1.60) + 1.60).toFixed(2));
      
      // Dates espacées de 2 mois
      const date = new Date();
      date.setMonth(date.getMonth() - (i * 2));
      metric.startDate = date;
      
      // La date de fin est définie pour les anciennes mesures
      if (i > 0) {
        const endDate = new Date(date);
        endDate.setMonth(endDate.getMonth() + 2);
        metric.endDate = endDate;
      }

      em.persist(metric);
    }
  }

  await em.flush();
  console.log(`Physical metrics seeded for ${athletes.length} athletes`);
}