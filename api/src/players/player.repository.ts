
import { BaseRepository } from '../repository.js';
import { query } from '../db.js';

import type {
  Player,
  PlayerView,
  PlayerSummary,
  PlayerSearch
} from './player.schema.js';

// Informations du joueur avec son équipe
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

  // Rechercher des joueurs
  async search(filtres: PlayerSearch) {

    const { page, limit, country, teamId, q } = filtres;

    const conditions: string[] = [];
    const valeurs: (string | number)[] = [];

    // Filtrer par pays
    if (country) {
      valeurs.push(country);
      conditions.push(`p.country = $${valeurs.length}`);
    }

    // Filtrer par équipe
    if (teamId) {
      valeurs.push(teamId);
      conditions.push(`p.team_id = $${valeurs.length}`);
    }

    // Rechercher dans le pseudo
    if (q) {
      valeurs.push(`%${q}%`);
      conditions.push(`p.nickname ILIKE $${valeurs.length}`);
    }

    // Construire le WHERE
    let where = '';

    if (conditions.length > 0) {
      where = 'WHERE ' + conditions.join(' AND ');
    }

    // Compter les résultats
    const resultat = await query<{ count: string }>(
      `SELECT COUNT(*) AS count
       FROM player p ${where}`,
      valeurs
    );

    const total = Number(resultat[0]?.count ?? 0);

    // Calculer la pagination
    const offset = (page - 1) * limit;

    // Récupérer les joueurs
    const items = await query<PlayerView>(
      `${VIEW} ${where}
       ORDER BY p.nickname
       LIMIT $${valeurs.length + 1}
       OFFSET $${valeurs.length + 2}`,
      [...valeurs, limit, offset]
    );

    return { items, total };
  }
}

export const players = new PlayerRepository();
