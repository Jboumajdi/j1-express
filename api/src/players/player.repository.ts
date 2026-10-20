
import { BaseRepository } from '../repository.js';
import { query } from '../db.js';

import type {
  Player,
  PlayerView,
  PlayerSummary
} from './player.schema.js';

// Requête pour récupérer un joueur avec son équipe
const VIEW = `
  SELECT
    p.id,
    p.nickname,
    p.country,
    p.role,
    p.rating,
    CASE
      WHEN t.id IS NULL THEN NULL
      ELSE json_build_object(
        'id', t.id,
        'name', t.name,
        'tag', t.tag
      )
    END AS team
  FROM player p
  LEFT JOIN team t ON p.team_id = t.id
`;

class PlayerRepository extends BaseRepository<Player> {

  constructor() {
    super(
      'player',
      [
        'id',
        'nickname',
        'country',
        'role',
        'rating',
        'birth_date AS "birthDate"',
        'team_id AS "teamId"'
      ],
      'nickname'
    );
  }

  // Récupérer tous les joueurs
  findViews(): Promise<PlayerView[]> {
    return query<PlayerView>(
      `${VIEW} ORDER BY p.nickname`
    );
  }

  // Récupérer un joueur par son ID
  async findView(id: number): Promise<PlayerView | null> {
    const joueurs = await query<PlayerView>(
      `${VIEW} WHERE p.id = $1`,
      [id]
    );

    return joueurs[0] ?? null;
  }

  // Récupérer les joueurs d'une équipe
  findByTeam(teamId: number): Promise<PlayerSummary[]> {
    return query<PlayerSummary>(
      `SELECT id, nickname, role, rating
       FROM player
       WHERE team_id = $1
       ORDER BY nickname`,
      [teamId]
    );
  }
}

export const playerRepository = new PlayerRepository();
