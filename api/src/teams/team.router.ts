
import { Router } from 'express';
import { HttpError } from '../errors.js';
import { parseId } from '../middlewares/params.js';
import { validate, validateQuery } from '../middlewares/validate.js';

import {
  TeamQuerySchema,
  TeamSchema,
  TeamPatchSchema,
  type TeamQuery,
  type TeamInput
} from './team.schema.js';

import { teamRepository } from './team.repository.js';

export const teamRouter = Router();


// GET : récupérer toutes les équipes
teamRouter.get('/', validateQuery(TeamQuerySchema), async (_req, res) => {

  const { country } = res.locals.query as TeamQuery;

  const teams = await teamRepository.findByCountry(country);

  res.json(teams);
});


// GET : récupérer une équipe par son ID
teamRouter.get('/:id', async (req, res) => {

  const id = parseId(req.params.id, 'Team');

  const team = await teamRepository.findOne(id);

  if (!team) {
    throw new HttpError(404, 'Team not found');
  }

  res.json(team);
});


// POST : créer une équipe
teamRouter.post('/', validate(TeamSchema), async (req, res) => {

  const team = await teamRepository.insert(req.body as TeamInput);

  res.status(201).location(`/api/teams/${team.id}`).json(team);
});


// PATCH : modifier une équipe
teamRouter.patch('/:id', validate(TeamPatchSchema), async (req, res) => {

  const id = parseId(req.params.id, 'Team');

  const team = await teamRepository.update(
    id,
    req.body as Partial<TeamInput>
  );

  if (!team) {
    throw new HttpError(404, 'Team not found');
  }

  res.json(team);
});


// DELETE : supprimer une équipe
teamRouter.delete('/:id', async (req, res) => {

  const id = parseId(req.params.id, 'Team');

  const deleted = await teamRepository.delete(id);

  if (!deleted) {
    throw new HttpError(404, 'Team not found');
  }

  res.sendStatus(204);
});
