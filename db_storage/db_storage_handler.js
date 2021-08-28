const Sequelize = require('sequelize');
const { database, dbuser, dbpw } = require('../config.json');

const sequelize = new Sequelize(database, dbuser, dbpw, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: database + '.sqlite',
});

const RegisteredUsers = sequelize.define('registered_users', {
	discord_tag: {
		type: Sequelize.STRING(255),
		primaryKey: true,
		allowNull: false,
	},
	coc_id: {
		type: Sequelize.STRING(255),
		primaryKey: true,
		allowNull: false,
	},
	coc_name: Sequelize.STRING(255),
	townhall_level: Sequelize.INTEGER
});

module.exports = {
	// Needs to be called AFTER the bot is ready to correctly sync the model with the database
	syncModel: (force_db = false) => {

		return new Promise((resolve, reject) => {

			sequelize
				.authenticate()
				.then(() => {
					console.log('Connection to database \'' + database + '\' has been established successfully.');
				})
				.catch((error) => {
					reject(new Error('Unable to connect to the database: ', error));
				});

			RegisteredUsers.sync({ force: force_db })
				.then(() => resolve())
				.catch((error) => {
					reject(new Error('Error during syncing: ', error));
				});

		});

	},
	// Returns a promise containing the entry
	addUser: (dc_tag, coc_id, coc_name, th_lvl) => {
		return RegisteredUsers.create({ discord_tag: dc_tag, coc_id: coc_id, coc_name: coc_name, townhall_level: th_lvl });
	} /* TODO: find user etc. */
};