
CDIRS = $(sort $(dir $(wildcard local-components/*/)))

build: preprocess components style.css template.js main.js
	component build -o bin -n main

clean:
	rm -rf bin components template.js style.css
	@$(foreach dir,$(CDIRS),(cd $(dir) && make clean || true &) &&) :

preprocess:
	@$(foreach dir,$(CDIRS),(cd $(dir) && make preprocess || true &) &&) :

components: component.json
	component install

template.js: template.jade
	rm -rf template.js
	jade -c -D < template.jade > template.temp.js
	@echo "var jade = require('jade');" >> template.js
	@echo "module.exports = " >> template.js
	cat template.temp.js >> template.js
	@echo ";" >> template.js
	rm template.temp.js

style.css: style.less
	lessc style.less > style.css

.PHONY: clean preprocess
