
all: syncs3 generate
	mongo admin --eval "db.runCommand({ fsync: 1 })"
	./generate

syncs3:
	./sync_frontend_s3

site: dumpdata
	@./node_modules/wintersmith/bin/wintersmith build

dumpdata:
	@node datadumper/exporter.js


.PHONY: dumpdata generate
