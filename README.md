# This is my master thesis repository

To start with first open a docker desktop app and run the docker-compose.yaml file that can be found in this folder.

To run it, open a git bash and run: sudo docker compose up -d

If you are running this on windows, you can modify the start-all.bat file with your paths and simply run this file.
This will initialize all the neo4j instances and the services that run with them, as well as the nodes and the server for the main form and dashboard.

Otherwise, to start them manually, from the project's main folder(modify the paths with your path):

From the main folder run:
npm install

To start the form:
npm run dev

To start the server.js:
cd server
node server.js

To start the docker images:
first open docker desktop app
Then from the git bash:
cd 'your-path'/blockchain-app/
docker compose up -d

To start db1-service:
cd services/db1-service
node .\index.js

To start db2-service:
cd services\db2-service
node .\index.js

To start db3-service:
cd services\db3-service
node .\index.js

To start the gateway service:
cd gateway
node .\gateway.js
