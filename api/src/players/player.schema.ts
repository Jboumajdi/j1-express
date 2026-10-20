
import { z } from 'zod';

// Joueur enregistré dans la base
export interface Player {
  id: number;
  nickname: string;
  country: string;
  role: string | null;
  rating: number;
  birthDate: string | null;
  teamId: number | null;
}

// Informations d'une équipe dans un joueur
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

// Vérifier que le joueur a au moins 13 ans
const BirthDateSchema = z.iso.date().refine((date) => {
  const limite = new Date();
  limite.setFullYear(limite.getFullYear() - 13);

  return new Date(date) <= limite;
}, 'Le joueur doit avoir au moins 13 ans');

// Vérifier les informations d'un joueur
export const PlayerSchema = z.object({
  nickname: z.string().min(2).max(30),
  country: z.string().regex(/^[A-Z]{2}$/),
  role: z.string().max(30).nullish(),
  rating: z.number().int().min(0).max(3000).optional(),
  birthDate: BirthDateSchema.nullish(),
  teamId: z.number().int().positive().nullish(),
});

export type PlayerInput = z.infer<typeof PlayerSchema>;

// Pour modifier seulement certains champs
export const PlayerPatchSchema = PlayerSchema.partial();
