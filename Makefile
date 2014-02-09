build:
	mkdir output 2>/dev/null || true
	cp -r stylesheets images javascripts style output
	node main.js

install:
	npm install .
