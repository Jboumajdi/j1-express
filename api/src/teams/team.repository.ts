
import type { Team, TeamWithPlayers } from './team.schema.js';
import { BaseRepository } from '../repository.js';
import { query } from '../db.js';
import { players } from '../players/player.repository.js';

class TeamRepository extends BaseRepository<Team> {

  constructor() {
    super('team', ['id', 'name', 'tag', 'country'], 'name');
  }

  // Récupérer les équipes avec un filtre par pays
  findByCountry(country?: string): Promise<Team[]> {

    // Si aucun pays n'est indiqué
    if (!country) {
      return query<Team>(
        `${this.select} ORDER BY name`
      );
    }

    // Si un pays est indiqué
    return query<Team>(
      `SELECT id, name, tag, country
       FROM team
       WHERE country = $1
       ORDER BY name`,
      [country]
    );
  }

  // Récupérer une équipe avec ses joueurs
  async findOneWithPlayers(id: number): Promise<TeamWithPlayers | null> {

    // Chercher l'équipe
    const team = await this.findOne(id);

    // Si l'équipe n'existe pas
    if (!team) {
      return null;
    }

    // Récupérer les joueurs de cette équipe
    const joueurs = await players.findByTeam(id);

    // Renvoyer l'équipe avec ses joueurs
    return {
      ...team,
      players: joueurs
    };
  }
}

export const teamRepository = new TeamRepository();
