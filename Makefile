build:
	mkdir output 2>/dev/null || true
	cp -r stylesheets images javascripts output
	node main.js

install:
	npm install .
