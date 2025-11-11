/* eslint-disable strict */
//var request = require('request');

const translatorApi = module.exports;

// translatorApi.translate = function (postData) {
// return ['is_english',postData];
// };

translatorApi.translate = async function (postData) {
	console.log(postData.content);
	try {

		const TRANSLATOR_API = 'http://translator:5000';
		const response = await fetch(TRANSLATOR_API + '/?content=' + postData.content);

		const data = await response.json();
		return [data.is_english, data.translated_content];
	} catch (error) {
		console.error(error);
		return [true, postData.content];
	}
};


