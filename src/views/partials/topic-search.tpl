{{{ if privileges.search:content }}}
<div component="topic-search" class="dropdown me-2">
	<button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="[[global:search-topics]]">
		<i class="fa fa-search text-primary"></i>
		<span class="d-none d-md-inline ms-1">[[global:search-topics]]</span>
	</button>

	<div class="dropdown-menu dropdown-menu-start p-3" style="min-width: 400px;">
		<div class="input-group mb-2">
			<input component="topic-search-input" type="text" class="form-control form-control-sm" placeholder="[[search:search-topics-placeholder]]" autocomplete="off">
			<button class="btn btn-outline-secondary btn-sm" type="button" title="[[search:advanced-search]]" onclick="this.closest('.dropdown').querySelector('[component=topic-search-input]').dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}))">
				<i class="fa fa-search"></i>
			</button>
		</div>

		<div component="topic-search-results" class="topic-search-results" style="max-height: 300px; overflow-y: auto;">
			<div class="text-muted text-center p-3">
				<i class="fa fa-search"></i>
				<br>
				[[search:start-typing-to-search]]
			</div>
		</div>

		<div class="border-top pt-2 mt-2">
			<small class="text-muted">
				<i class="fa fa-lightbulb-o"></i>
				[[search:press-enter-for-advanced]]
			</small>
		</div>
	</div>
</div>
{{{ end }}}