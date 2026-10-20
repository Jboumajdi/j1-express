
import { z } from 'zod';

// Informations d'un joueur dans la base
export interface Player {
  id: number;
  nickname: string;
  country: string;
  role: string | null;
  rating: number;
  birthDate: string | null;
  teamId: number | null;
}

// Informations envoyées par l'API
export interface PlayerView {
  id: number;
  nickname: string;
  country: string;
  role: string | null;
  rating: number;
  team: {
    id: number;
    name: string;
    tag: string;
  } | null;
}

// Joueur affiché dans une équipe
export interface PlayerSummary {
  id: number;
  nickname: string;
  role: string | null;
  rating: number;
}

// Vérifier les données d'un joueur
export const PlayerSchema = z.object({
  nickname: z.string().trim().min(2).max(30),
  country: z.string().regex(/^[A-Z]{2}$/),
  role: z.string().trim().max(30).nullish(),
  rating: z.number().int().min(0).max(3000).optional(),

  birthDate: z.iso.date().refine((date) => {
    const naissance = new Date(date);
    const limite = new Date();

    limite.setFullYear(limite.getFullYear() - 13);

    return naissance <= limite;
  }, 'must be at least 13 years old').nullish(),

  teamId: z.number().int().positive().nullish()
});

export type PlayerInput = z.infer<typeof PlayerSchema>;

// Pour modifier un joueur
export const PlayerPatchSchema = PlayerSchema.partial();

// Pour rechercher des joueurs
export const PlayerSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),

  country: z.string()
    .regex(/^[A-Za-z]{2}$/)
    .transform((s) => s.toUpperCase())
    .optional(),

  teamId: z.coerce.number().int().positive().optional(),
  q: z.string().optional()
});

export type PlayerSearch = z.infer<typeof PlayerSearchSchema>;
