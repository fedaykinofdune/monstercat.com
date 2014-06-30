
build: 
	rsync -u -r --delete client/assets/ server/public/client
	cd client && make
	rsync -u -r client/bin/ server/public/client

clean: 
	rm -rf server/public/client
	cd client && make clean

.PHONY: clean