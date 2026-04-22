.PHONY: up down bash migrate fresh logs ps build

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build --no-cache

bash:
	docker compose exec php-fpm bash

migrate:
	docker compose exec php-fpm php artisan migrate

fresh:
	docker compose exec php-fpm php artisan migrate:fresh --seed

logs:
	docker compose logs -f

ps:
	docker compose ps

install:
	docker compose exec php-fpm composer install
	docker compose exec php-fpm php artisan key:generate
	docker compose exec php-fpm php artisan storage:link

horizon-logs:
	docker compose logs -f horizon

tinker:
	docker compose exec php-fpm php artisan tinker
