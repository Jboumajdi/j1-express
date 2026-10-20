
import { Router } from 'express';
import { HttpError } from '../errors.js';
import { parseId } from '../middlewares/params.js';
import { validate, validateQuery } from '../middlewares/validate.js';

import {
  PlayerSchema,
  PlayerPatchSchema,
  PlayerSearchSchema,
  type PlayerInput,
  type PlayerSearch
} from './player.schema.js';

import { players } from './player.repository.js';

export const playerRouter = Router();


// GET : rechercher les joueurs
playerRouter.get('/', validateQuery(PlayerSearchSchema), async (_req, res) => {

  const filtres = res.locals.query as PlayerSearch;

  const resultat = await players.search(filtres);

  res.set('X-Total-Count', String(resultat.total));

  res.json(resultat.items);
});


// GET : récupérer un joueur par son ID
playerRouter.get('/:id', async (req, res) => {

  const id = parseId(req.params.id, 'Player');

  const player = await players.findView(id);

  if (!player) {
    throw new HttpError(404, 'Player not found');
  }

  res.json(player);
});


// POST : créer un joueur
playerRouter.post('/', validate(PlayerSchema), async (req, res) => {

  const nouveauJoueur = await players.insert(req.body as PlayerInput);

  const player = await players.findView(nouveauJoueur.id);

  res.status(201)
    .location(`/api/players/${nouveauJoueur.id}`)
    .json(player);
});


// PATCH : modifier un joueur
playerRouter.patch('/:id', validate(PlayerPatchSchema), async (req, res) => {

  const id = parseId(req.params.id, 'Player');

  const updated = await players.update(
    id,
    req.body as Partial<PlayerInput>
  );

  if (!updated) {
    throw new HttpError(404, 'Player not found');
  }

  const player = await players.findView(id);

  res.json(player);
});


// DELETE : supprimer un joueur
playerRouter.delete('/:id', async (req, res) => {

  const id = parseId(req.params.id, 'Player');

  const deleted = await players.delete(id);

  if (!deleted) {
    throw new HttpError(404, 'Player not found');
  }

  res.sendStatus(204);
});
