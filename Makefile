
all:
	./sync_frontend_s3
	echo "syncing db"
	mongo admin --eval "db.runCommand({ fsync: 1 })"
	./generate
