CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  price NUMERIC(10, 2) NOT NULL,
  size NUMERIC(10, 2) NOT NULL,
  type VARCHAR(4) CHECK (type IN ('buy', 'sell')) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(10) CHECK (status IN ('open', 'closed')) NOT NULL
);