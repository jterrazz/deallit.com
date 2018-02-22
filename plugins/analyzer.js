const currenciesPlugin = require('../plugins/currencies');
const env = require('../config/env');

const imagesFolder = env.staticServerUrl + 'public/images/';

module.exports = {

	//TODO:30 Do all notifications
	decodeNotifications: (notifications) => {
		notifications.forEach(notification => {
			try {
				var params = JSON.parse(notification.params);
			} catch (e) {
				var params = {};
			}
			notification.link = '#'
			switch (notification.type) {
				case 'welcome-1':
					notification.message = "Bienvenue sur my market, commencez des maintenant a vendre vos objects"
					break;
				case 'order-transmitted-1':
					notification.message = `The order of ${ params.order_id } `
					notification.link = `/orders/${ params.order_id }`
					break;
			}
		})
	},

	imagesURL: (arrayToAnalyse) => {
		const imageKeys = ['market_background', 'image', 'user_image'];

		arrayToAnalyse.forEach(item => {
			imageKeys.forEach(key => {
				if (item[key])
					item[key] = imagesFolder + item[key];
			})

			try {
				item.images = JSON.parse(item.images);
				if (Array.isArray(item.images)) {
					item.images.forEach((image, i) => {
						item.images[i] = imagesFolder + image;
						if (!i)
							item.preview = imagesFolder + image;
					})
				}
			} catch (e) {
				item.images = null;
			}
		})
	},

	tags: (arrayToAnalyse) => {
		arrayToAnalyse.forEach(item => {
			if (item.tags)
				item.tags = item.tags.split(',')
			else
				item.tags = []
		})
	},

	//TODO Clearer code
	currencies: (products) => {
		return new Promise((resolve, reject) => {
			var ftArray = [];

			products.forEach(product => {
				ftArray.push(currenciesPlugin.oneToMany(product.price_type, product.price));
			})
			Promise.all(ftArray)
				.then(ret => {
					ret.forEach((newPrices, i) => {
						newPrices.usd = Number(newPrices.usd).toFixed(2);
						newPrices.eur = Number(newPrices.eur).toFixed(2);
						newPrices.btc = Number(newPrices.btc).toFixed(env.DECIMALS_PRICE_BTC);
						products[i].prices = newPrices;
					})
					return resolve();
				})
				.catch(err => {
					return reject(err);
				})
		});
	}
}
