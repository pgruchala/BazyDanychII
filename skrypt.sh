docker run --name techmarket -e POSTGRES_PASSWORD=pgdb -p 5432:5432 -d postgres

sleep 2

docker run -d \
    -p 27018:27017 \
    --name test-mongo \
    -v data-vol:/data/db \
    mongo:latest


# Aby połączyć się z zewnątrz do mongodb, trzeba użyć:
#mongosh --host localhost --port 27018