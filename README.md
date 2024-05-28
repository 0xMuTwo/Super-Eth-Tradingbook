# How To Run.

Instructions on how to run the application locally.

## Step 1. Initialize Backend

Ensure you're in the root of the system and run

```bash
docker compose up --build
```

You should see

```bash
 ✔ Container opyn-db-1       Created
 ✔ Container opyn-backend-1  Created
```

If this is your first run, you will also see

```bash
✔ Network opyn_default      Created
✔ Volume "opyn_db-data"     Created
```

This is showing initialization of the PostGreSQL Server.

You should also be seeing comments from the backend, letting you know of successful connection to the server.

```bash
opyn-backend-1  | > opyn-backend@1.0.0 start
opyn-backend-1  | > node dist/app.js
opyn-backend-1  | Server running at PORT: 5001
opyn-backend-1  | Connected to database: { now: 2024-05-28T02:48:27.777Z }
```

Once this has been setup, you have a working backend for the application.

## Step 2. Run Frontend

In a separate terminal, cd into `/frontend`.
Run `npm install` to get all required packages.
Copy `.template.env` to a `.env.local` file at the same root level.
Run `npm run dev` and go to the link it's given you.

### Possible Errors:

The `template.env` assumes you're running the backend on port `5001`.
If your server is running on a different port, copy that into the ENV.

## Operation

This application aims to show general functionality of an ETH/USDT trading book.
Open two separate windows, on one window act as the buyer, and the other act as the seller.
Place orders as the buyer in one window, and sell orders on the other window.
Go to Admin Menu > Match Algorithm to execute the trades.
You may also delete all orders and start over.

The server status button should be pulsing green to indicate successful websocket connections.
Without this, you will be unable to get proper backend<>frontend updates.

This is also deployed live at `https://opyn-takehome.vercel.app` but keep in mind, in the off chance two people are using it at the same time, expect strange behaviors.

## Shutdown

A graceful shutdown will remove the database and leave no residue in docker.

First, shut down the frontend with

```bash
CTRL-C
```

on the frontend terminal.

Next, use

```bash
docker compose down --volumes
```

in the root directory of the project

You can ensure it's shutdown correctly with

```bash
docker ps
```

# Architecture & Design Choices.

## Initial Thoughts

### Frontend

The frontend was chosen as Vercel's [Next.js](https://nextjs.org/) with a state management library of [Zustand](https://zustand-demo.pmnd.rs/).

These were chosen primarily because initial conversations with the Opyn team revealed they were already using these frameworks, so code review would be easier for them. I don't have much of a preference in terms of React Meta Frameworks, they all have pros and cons, I like Vercel's ease of deployment but am not a fan of Next.JS 14's hyper-aggressive caching or defaulting to server components.

Neither of these cons have been addresses in the frontend as I wanted to keep this project as Vanilla as possible, optimizing for quick code reviews. Nothing experimental or off-path.

### Backend

My first thought was that I didn't want to pay for a server.

It's a pain and can get really expensive, even at the lowest maintenance tiers. And at this point I was not sure what sort of tables/data I would need to store.
The requirements specified that the backend should be a Node.JS/Express server. I was already planning to deploy this using Docker on some sort of Digital Ocean or S3 Container.
This was a perfect opportunity to use [Docker Compose](https://docs.docker.com/compose/) and have a small Postgres server running in the same instance as the Express app. This also has some neat side effects, near instant connections as it's running via localhost, and less worries about securing the database. Nearly all ports can be open/unmonitored, as we just need to watch actual traffic to/from the droplet.

### Matching Algorithm

This was a bit challenging to implement. The first iteration was quite simple (if buyOrder.price = sellOrder.price, distribute money) but when I started using it, it became clear that while this would technically fulfil the challenge, it did not embody the spirit and gave a very bad user experience.

The next thing I implemented was the FIFO order system, which wasn't too difficult, just ordering via timestamps and popping as they got filled.

After this, we moved on to partial orders.
A particular quirk of my system is that the bid amount gets removed from the account and goes directly into the book once it's been confirmed. This made it extra important that an entire operation was completed, or else orders (and the money they represent) could be completely lost. This is why we're using SQL commit and rollback operations, in an actual blockchain operation this would all be taken care of for us.

# Challenges & Solutions

## The Algorithm

I'm a fairly competent at Frontend, and am not shy to design system architecture and devops, but the algorithm for the matching became difficult due to the changing requirements. Moving it to partial fills & user balance calculations took a bit longer than I'd care to admit working correctly. I thought a lot about DB reads VS redoing calculations in memory, it was especially tempting to do DB reads as the database had near instant response time, but in terms of scalability, it was absolutely not the right move.
If I had more time and were designing a most scalable system, I would consider using indexes on price and timestamp columns for faster sorting, collecting and doing updates in batch, and adding unit tests for edge cases that may break when altering the algorithm.

## Deployment

Deploying to a digial ocean droplet was easy enough, but getting it in a form where it was accessible from the React App took effort. This was mainly due to HTTPS & WSS issues. I was able to solve this by using an old domain name I happened to have, and performing a reverse proxy to allow traffic to go through the domain then act as local traffic for my localhost:5001 to serve to normally. I'm especially proud of this solution as it allowed for minimal code changes, having a vastly different production and development server is never fun. And this system allows my application to have no idea where the traffic is coming from, allowing local deployments to be 1:1 with production. The trade offs are definitely the technical complexity that comes with it if we ever had to move services, it would require a new NGINX config and a few hours of an engineer's time.

# TODO List

## Backend Part 1

- [x] Create Express App.
- [x] Dockerize Express App.
- [x] Convert to Typescript.
- [x] Initialize Database
- [x] Connect Database to Express App
- [x] Automate DB Creation via Docker
- [x] Create /health endpoint
- [x] Create /orders endpoint
- [x] Create /book endpoint

## Frontend Part 1

- [x] Create NextJS App.
- [x] Split UI into User Info, Orderbook and Trading Interface
- [x] On Refresh, New User with random ETH and Dollar Balance
- [x] Display Order Book, calls '/book'
- [x] Style Order Book
- [x] Create Trading Interface
- [x] Order Places hit '/orders' endpoint
  - [x] Implement Zustand State Management
  - [x] Safeguards for selling more than you have
  - [x] Removing from Balance on Bid
- [x] Implement Matching
  - [x] Matching Algorithm
    - [x] FIFO
    - [x] Partial Fills
  - [x] Payload to update user balances on Match
  - [x] Web Socket updates orderbook
  - [x] Web Socket updates user balances

## Polish 1

- [x] Known bug can go negative if spamming button, need balance check on "Bid"
- [x] Allow user to implement /match & /delete-all
- [x] UI Cleanup!
- [x] Little Health Checker, Shows if server is healthy on Frontend
- [x] Add envs for links to db -[x] Put websocket in ENV
- [x] Change name from "Create Next App"

## Production

- [x] Fix Bug
  - [x] Buy order @ $10, Sell order @ 9 & 11, neither go through?
  - [x] Probably have to rework algo, retest FIFO and Partials
- [x] Refactor Server
- [x] Refactor Frontend
- [x] Host on digital ocean droplet
- [x] Use nginx reverse proxy for SSL

## Delivery

- [x] Deploy Live Somewhere [Deployment](https://opyn-takehome.vercel.app/)
- [x] Give thorough instructions for how someone could run this
