export default class Match {
	constructor( [ _week, homeTeam, homeGoal, awayGoal, awayTeam, _finished ] ) {
		this._week = parseInt( _week ) //
		this.homeTeam = homeTeam;
		this.homeGoal = parseInt( homeGoal ) || 0;
		this.awayTeam = awayTeam;
		this.awayGoal = parseInt( awayGoal ) || 0;
		this._resMatch = ( homeGoal - awayGoal ) < 0 ? -1 : ( ( homeGoal - awayGoal ) > 0 ? 1 : 0 );
		this._finished = _finished;
	}
}