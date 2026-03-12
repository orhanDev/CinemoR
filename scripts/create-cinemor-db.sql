SELECT 'CREATE DATABASE "cinemor-api"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cinemor-api')
\gexec
