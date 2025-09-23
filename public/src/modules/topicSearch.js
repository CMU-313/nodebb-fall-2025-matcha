'use strict';

define('topicSearch', ['alerts', 'bootstrap', 'api'], function (alerts, bootstrap, api) {
	const topicSearch = {};

	topicSearch.init = function (el, options) {
		options = options || {};
		options.cid = options.cid || 0;

		const searchEl = el.find('[component="topic-search-input"]');
		if (!searchEl.length) {
			return;
		}

		const resultsEl = el.find('[component="topic-search-results"]');
		const toggleVisibility = searchEl.parents('[component="topic-search"]').length > 0;

		el.on('show.bs.dropdown', function () {
			if (toggleVisibility) {
				searchEl.removeClass('hidden');
			}

			function doSearch() {
				const val = searchEl.val();
				if (val.length > 1) {
					loadTopics(val, function (topics) {
						renderResults(topics);
					});
				} else if (!val) {
					renderResults([]);
				}
			}

			searchEl.on('click', function (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			});

			searchEl.val('').on('keyup', utils.debounce(doSearch, 300));

			// Show recent topics when focused
			if (options.showRecent !== false) {
				loadTopics('', function (topics) {
					renderResults(topics);
				});
			}
		});

		el.on('shown.bs.dropdown', function () {
			if (!['xs', 'sm'].includes(utils.findBootstrapEnvironment())) {
				searchEl.focus();
			}
		});

		el.on('hide.bs.dropdown', function () {
			if (toggleVisibility) {
				searchEl.addClass('hidden');
			}
			searchEl.off('click keyup');
		});

		// Handle enter key to filter current page topics
		searchEl.on('keydown', function (e) {
			if (e.key === 'Enter') {
				e.preventDefault();
				const query = searchEl.val().trim();
				if (query) {
					performPageFilter(query);
					// Close dropdown
					const dropdown = bootstrap.Dropdown.getInstance(el.find('.dropdown-toggle').get(0));
					if (dropdown) {
						dropdown.hide();
					}
				}
			}
		});

		function performPageFilter(query) {
			api.get('/api/v3/search/topics', {
				query: query,
				cid: options.cid || 0,
				resultsPerPage: 100,
				paginate: true,
			}, function (err, result) {
				if (err) {
					return alerts.error(err);
				}

				// Filter current page topics by search results
				// Handle both direct API response and v3 API response format
				const topics = result.topics || (result.response ? result.response.topics || [] : []);
				filterCurrentPageTopics(topics);
			});
		}

		function filterCurrentPageTopics(searchResults) {
			const searchTids = new Set(searchResults.map(topic => parseInt(topic.tid, 10)));
			const topicElements = $('[component="category/topic"]');

			topicElements.each(function () {
				const $this = $(this);
				const tid = parseInt($this.attr('data-tid'), 10);

				if (searchTids.has(tid)) {
					$this.removeClass('search-hidden').attr('style', '');
				} else {
					$this.addClass('search-hidden').attr('style', 'display: none !important;');
				}
			});

			// Show/hide "no topics" message
			const visibleTopics = topicElements.not('.search-hidden');
			if (visibleTopics.length === 0) {
				showNoTopicsMessage();
			} else {
				hideNoTopicsMessage();
			}
		}

		function showNoTopicsMessage() {
			const container = $('[component="category"], [component="topics"]').first();
			if (!container.find('.no-search-results').length) {
				container.append('<div class="no-search-results alert alert-info">No topics found</div>');
			}
		}

		function hideNoTopicsMessage() {
			$('.no-search-results').remove();
		}

		function loadTopics(search, callback) {
			const searchData = {
				query: search,
				cid: options.cid,
				resultsPerPage: 10,
				paginate: true,
			};

			api.get('/api/v3/search/topics', searchData, function (err, result) {
				if (err) {
					return alerts.error(err);
				}
				// Handle both direct API response and v3 API response format
				const topics = result.topics || (result.response ? result.response.topics || [] : []);
				callback(topics);
			});
		}

		function renderResults(topics) {
			if (!topics.length) {
				resultsEl.html('<div class="text-muted p-3">No topics found</div>');
				return;
			}

			const topicsHtml = topics.map(function (topic) {
				const relativeTime = utils.toISOString(topic.timestamp);
				return `
					<a href="${config.relative_path}/topic/${topic.slug}" class="list-group-item list-group-item-action">
						<div class="d-flex w-100 justify-content-between align-items-start">
							<div class="flex-grow-1">
								<h6 class="mb-1 topic-title">${topic.title}</h6>
								<small class="text-muted">
									${topic.category ? `[[${topic.category.name}]]` : ''} •
									<span class="timeago" title="${relativeTime}">${relativeTime}</span>
								</small>
							</div>
							<small class="text-muted ms-2">${topic.postcount || 0} [[topic:posts]]</small>
						</div>
					</a>
				`;
			}).join('');

			resultsEl.html('<div class="list-group">' + topicsHtml + '</div>');
			resultsEl.find('.timeago').timeago();

			const bsDropdown = bootstrap.Dropdown.getInstance(el.find('.dropdown-toggle').get(0));
			if (bsDropdown) {
				bsDropdown.update();
			}
		}
	};

	return topicSearch;
});