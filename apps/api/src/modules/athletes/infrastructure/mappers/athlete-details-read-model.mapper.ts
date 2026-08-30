import type { AthleteDetailsReadModel } from '../../application/models/athlete-details.read-model';

type NullableNumber = number | string | null | undefined;

type AthleteDetailsReadModelRow = {
  id: string;
  firstName: string;
  lastName: string;
  birthday: Date | null;
  country: string | null;
  email?: string | null;
  image?: string | null;
  pm_weight?: NullableNumber;
  level?: string | null;
  sex_category?: string | null;
  sexCategory?: string | null;
  weight_category?: NullableNumber;
  weightCategory?: NullableNumber;
  pr_snatch?: NullableNumber;
  pr_cleanAndJerk?: NullableNumber;
};

const toNumberOrNull = (value: NullableNumber): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
};

export const toAthleteDetailsReadModel = (
  row: AthleteDetailsReadModelRow
): AthleteDetailsReadModel => {
  const level = row.level ?? null;
  const sexCategory = row.sex_category ?? row.sexCategory ?? null;
  const weightCategory = toNumberOrNull(
    row.weight_category ?? row.weightCategory
  );

  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    birthday: row.birthday,
    country: row.country,
    email: row.email ?? '',
    image: row.image ?? '',
    currentWeight: toNumberOrNull(row.pm_weight),
    competitorStatus:
      level || sexCategory || weightCategory !== null
        ? {
            level: level ?? '',
            sexCategory: sexCategory ?? '',
            weightCategory,
          }
        : null,
    personalRecords: {
      snatch: toNumberOrNull(row.pr_snatch),
      cleanAndJerk: toNumberOrNull(row.pr_cleanAndJerk),
    },
  };
};

export const toAthleteDetailsReadModelList = (
  rows: AthleteDetailsReadModelRow[]
): AthleteDetailsReadModel[] => rows.map(toAthleteDetailsReadModel);
