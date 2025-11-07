/* eslint-disable strict */
//var request = require('request');

const translatorApi = module.exports;

// translatorApi.translate = function (postData) {
// return ['is_english',postData];
// };

translatorApi.translate = async function (postData) {
	try {
		const TRANSLATOR_API = '127.0.0.1:5000'; // TODO: Add the translator API URL
		const response = await fetch(TRANSLATOR_API + ' /?content=' + postData.content);
		const data = await response.json();
		return [data.is_english, data.translated_content];
	} catch (error) {
		console.error(error);
		return [true, postData.content];
	}
};


