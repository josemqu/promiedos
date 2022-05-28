export default class Team {
	constructor(
		id,
		name,
		pos,
		win,
		loss,
		draw,
		gf,
		ga
	) {

		this.id = id;
		this.name = name;
		this.pos = pos;
		this.win = win;
		this.loss = loss;
		this.draw = draw;
		this.pts = win * 3 + draw;
		this.gf = gf
		this.ga = ga
		this.gd = gf - ga
		this.played = win + loss + draw
		this.thumbnail = `https://www.promiedos.com.ar/images/30/${id}.png`

	}

}