
import { Router } from 'express';
import { HttpError } from '../errors.js';
import { parseId } from '../middlewares/params.js';
import { validate } from '../middlewares/validate.js';

import {
  PlayerSchema,
  PlayerPatchSchema,
  type PlayerInput
} from './player.schema.js';

import { playerRepository } from './player.repository.js';

export const playerRouter = Router();


// GET : tous les joueurs
playerRouter.get('/', async (_req, res) => {
  const joueurs = await playerRepository.findViews();

  res.json(joueurs);
});


// GET : un joueur par son ID
playerRouter.get('/:id', async (req, res) => {
  const id = parseId(req.params.id, 'Player');

  const joueur = await playerRepository.findView(id);

  if (!joueur) {
    throw new HttpError(404, 'Player not found');
  }

  res.json(joueur);
});


// POST : créer un joueur
playerRouter.post('/', validate(PlayerSchema), async (req, res) => {
  const nouveauJoueur = await playerRepository.insert(
    req.body as PlayerInput
  );

  const joueur = await playerRepository.findView(nouveauJoueur.id);

  res.status(201)
    .location(`/api/players/${nouveauJoueur.id}`)
    .json(joueur);
});


// PATCH : modifier un joueur
playerRouter.patch('/:id', validate(PlayerPatchSchema), async (req, res) => {
  const id = parseId(req.params.id, 'Player');

  const modification = await playerRepository.update(
    id,
    req.body as Partial<PlayerInput>
  );

  if (!modification) {
    throw new HttpError(404, 'Player not found');
  }

  const joueur = await playerRepository.findView(id);

  res.json(joueur);
});


// DELETE : supprimer un joueur
playerRouter.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id, 'Player');

  const deleted = await playerRepository.delete(id);

  if (!deleted) {
    throw new HttpError(404, 'Player not found');
  }

  res.sendStatus(204);
});
