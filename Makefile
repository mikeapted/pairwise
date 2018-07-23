build-dev :
	docker build -t pairwise-app:dev .

build-prod :
	docker build -f Dockerfile.prod -t pairwise-app:prod .

run-dev :
	docker run -it \
		-v ${PWD}\:/usr/src/app \
		-v /usr/src/app/node_modules \
		-p 3000\:3000 \
		--rm pairwise-app:dev

run-prod :
	docker run -it -p 8080:80 --rm pairwise-app:prod

run-docker-hub :
	docker run -it -p 8080:80 --rm mikeapted/pairwise-app:prod
