# Operating Instructions

Run

```bash
docker compose up --build
```

Shutdown gracefully.

```bash
docker compose down --volumes
```

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
