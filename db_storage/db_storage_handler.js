const Sequelize = require('sequelize');
const { database, dbuser, dbpw } = require('../config.json');

const sequelize = new Sequelize(database, dbuser, dbpw, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: database + '.sqlite',
});

const accountLinks = sequelize.define('account_links', {
	discord_id: {
		type: Sequelize.STRING(255),
		primaryKey: true,
		allowNull: false,
	},
	coc_id: {
		type: Sequelize.STRING(255),
		primaryKey: true,
		allowNull: false,
		unique: true,
	},
	coc_name: Sequelize.STRING(255),
	coc_townhall_level: Sequelize.INTEGER
});

const townhallRoles = sequelize.define('townhall_roles', {
	townhall: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		allowNull: false,
		unique: true,
	},
	role_id: {
		type: Sequelize.STRING(255),
		allowNull: false,
	}
});

module.exports = {
	// Needs to be called AFTER the bot is ready to correctly sync the model with the database
	syncModel: (force_db = false) => {

		return new Promise(async (resolve, reject) => {

			await sequelize
				.authenticate()
				.catch((error) => {
					reject(new Error('Unable to connect to the database: ', error));
				});

			await accountLinks.sync({ force: force_db })
				.catch((error) => {
					reject(new Error('Error during syncing: ', error));
				});

			await townhallRoles.sync({ force: force_db })
				.catch((error) => {
					reject(new Error('Error during syncing: ', error));
				});

			resolve('Connection to database \'' + database + '\' has been established successfully.');
		});

	},
	addLink: (dc_id, coc_id, coc_name, coc_th_lvl) => {
		return accountLinks.create({ discord_id: dc_id, coc_id: coc_id, coc_name: coc_name, coc_townhall_level: coc_th_lvl });
	},
	getLink: (dc_id, coc_id) => {
		return accountLinks.findOne({ where: { discord_id: dc_id, coc_id: coc_id } });
	},
	deleteLink: (dc_id, coc_id) => {
		return accountLinks.destroy({ where: { discord_id: dc_id, coc_id: coc_id } });
	},
	getLinksFromDiscordId: (dc_id) => {
		return accountLinks.findAll({ where: { discord_id: dc_id } });
	},
	getLinkFromCoCId: (coc_id) => {
		return accountLinks.findOne({ where: { coc_id: coc_id } });
	},
	addTownhallRole: (townhall, role_id) => {
		return townhallRoles.create({ townhall: townhall, role_id: role_id });
	},
	editTownhallRole: (townhall, role_id) => {
		return townhallRoles.update({ role_id: role_id }, { where: { townhall: townhall } });
	},
	getTownhallRole: (townhall) => {
		return townhallRoles.findOne({ where: { townhall: townhall } });
	},
	deleteTownhallRole: (townhall) => {
		return townhallRoles.destroy({ where: { townhall: townhall } });
	}
};