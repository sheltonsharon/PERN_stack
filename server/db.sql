----postgrestutorial.com---
CREATE DATABASE practice;

CREATE TABLE products ( id INT, name VARCHAR(50), price INT, on_sale
boolean);

\d to list all the tables in the database
\d table_name -> to get the structure of the table

ALTER TABLE products ADD COLUMN featured boolean;

ALTER TABLE products DROP COLUMN featured;

----------------------------
YELP:

CREATE TABLE restaurants (
     id BIGSERIAL NOT NULL PRIMARY KEY, 
     name VARCHAR(50) NOT NULL,
     location VARCHAR(50) NOT NULL,
     price_range INT NOT NULL check(price_range >= 1 and price_range <= 5)
);

BIGSERIAL --> auto-increment


INSERT INTO restaurants (name, location, price_range) values('Odel', 'NGL', 3);

CREATE TABLE reviews (
     id BIGSERIAL NOT NULL PRIMARY KEY,
     restaurant_id BIGINT NOT NULL REFERENCES restaurants(id),
     name VARCHAR(50) NOT NULL,
     review TEXT NOT NULL,
     rating INT NOT NULL check(rating >=1 and rating <=5)
);

SELECT * FROM restaurants LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id;

---same query above, to get individual restaurant data with the WHERE condition