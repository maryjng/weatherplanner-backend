DROP DATABASE calendar;
CREATE DATABASE calendar;
\connect calendar

\i calendar-schema.sql
\i calendar-seed.sql

DROP DATABASE calendar_test;
CREATE DATABASE calendar_test;
\connect calendar_test

\i calendar-schema.sql