.PHONY: help data amphtml-docs-get amphtml-docs-parse

help:				## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-12s\033[0m %s\n", $$1, $$2}'

data:				## Generate theme data files
	@mkdir -p data/amp; \
	make amphtml-docs-get; make amphtml-docs-parse > data/amp/src.json

amphtml-docs-get:	## Download latest amphtml docs
	@mkdir -p tmp; cd tmp; \
	wget -qO- $$(curl -sL https://api.github.com/repos/ampproject/amphtml/releases/latest | jq -r '.tarball_url') | tar xvz --strip-components=1 */extensions/*.md

amphtml-docs-parse:	## Parse amphtml docs to generate json object of components
	@perl -n -e'/src="(https:\/\/cdn.ampproject.org\/v[0-9]+\/)(.*)(-\d+\.\d+\.js)"/ && print "{\"$$2\": \"$$1$$2$$3\"}\n"' \
	`find . -mindepth 4 -maxdepth 4 -name '*.md'` \
	| sort \
	| uniq \
	| jq --slurp add
