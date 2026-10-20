import { z } from 'zod';

// Informations d'une équipe
export interface Team {
  id: number;
  name: string;
  tag: string;
  country: string;
}

// Vérification du filtre country
export const TeamQuerySchema = z.object({
  country: z.string()
    .regex(/^[A-Za-z]{2}$/)
    .transform((s) => s.toUpperCase())
    .optional(),
});

export type TeamQuery = z.infer<typeof TeamQuerySchema>;

// Vérification des données pour créer une équipe
export const TeamSchema = z.object({
  name: z.string().trim().min(2).max(50),
  tag: z.string().regex(/^[A-Z0-9]{2,5}$/),
  country: z.string().regex(/^[A-Z]{2}$/),
});

export type TeamInput = z.infer<typeof TeamSchema>;

// Vérification des données pour modifier une équipe
export const TeamPatchSchema = TeamSchema.partial();
