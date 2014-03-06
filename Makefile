
all: syncs3 site
	mongo admin --eval "db.runCommand({ fsync: 1 })"

podcast:
	@./node_modules/wintersmith/bin/wintersmith build

syncs3:
	./sync_frontend_s3

node_modules:
	npm install

testsite: testdata node_modules
	@./node_modules/wintersmith/bin/wintersmith build

site: dumpdata
	@./node_modules/wintersmith/bin/wintersmith build

dumpdata:
	@node datadumper/exporter.js

testdata:
	cp ./testdata/release_data.json contents
	cp ./testdata/data.json contents

.PHONY: dumpdata generate testdata podcast
