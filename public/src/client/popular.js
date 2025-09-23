'use strict';


define('forum/popular', ['topicList', 'topicSearchSimple'], function (topicList, topicSearchSimple) {
	const Popular = {};

	Popular.init = function () {
		app.enterRoom('popular_topics');

		topicList.init('popular');

		// Initialize topic search
		topicSearchSimple.init({});
	};

	return Popular;
});
