# Operating Instructions

Step 1. Run Backend

```bash
docker compose up --build
```

Shutdown gracefully.

```bash
docker compose down --volumes
```

Step 2. Run frontend

`cd frontend`
`npm run dev`
switch env to backend link

tree -a -L 2 -I 'node_modules|.git'024-05-25

# Backend Docs.

endpoints

/orders
POST

payload format (JSON):
order:{
username: username (string)
side: buy | sell (enum)
size: assetAmount (number)
price: pricePerAsset (number)
}

/book
GET
order[]

/match
POST

TODO List

### Backend Part 1

- [x] Create Express App.
- [x] Dockerize Express App.
- [x] Convert to Typescript.
- [x] Initialize Database
- [x] Connect Database to Express App
- [x] Automate DB Creation via Docker
- [x] Create /health endpoint
- [x] Create /orders endpoint
- [x] Create /book endpoint

### Frontend Part 1

- [x] Create NextJS App.
- [x] Split UI into User Info, Orderbook and Trading Interface
- [x] On Refresh, New User with random ETH and Dollar Balance
- [x] Display Order Book, calls '/book'
- [x] Style Order Book
- [x] Create Trading Interface
- [x] Order Places hit '/orders' endpoint
- [] Implement Matching
- [] Web Socket
- [] Add envs for links to db

### Random Tasks

- [] Little Health Checker, Shows if server is healthy on Frontend
