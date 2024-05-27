import { pool } from "./db";
import { Order } from "./interfaces";

export async function matchOrders() {
  const client = await pool.connect();
  const instructions: Array<{
    username: string;
    asset: string;
    amount: number;
  }> = [];
  const orderBook = { buyOrders: [] as Order[], sellOrders: [] as Order[] };

  try {
    await client.query("BEGIN");
    const buyOrdersResult = await client.query(
      "SELECT * FROM orders WHERE status = 'open' AND type = 'buy' ORDER BY price DESC, timestamp ASC"
    );
    const sellOrdersResult = await client.query(
      "SELECT * FROM orders WHERE status = 'open' AND type = 'sell' ORDER BY price ASC, timestamp ASC"
    );
    let buyOrders = buyOrdersResult.rows as Order[];
    let sellOrders = sellOrdersResult.rows as Order[];

    console.log("Initial Buy Orders:", JSON.stringify(buyOrders, null, 2));
    console.log("Initial Sell Orders:", JSON.stringify(sellOrders, null, 2));

    const orderUpdates: Array<{
      id: number;
      size: number;
      status?: "open" | "closed";
    }> = [];
    let i = 0,
      j = 0;

    while (i < buyOrders.length && j < sellOrders.length) {
      const buyOrder = buyOrders[i];
      const sellOrder = sellOrders[j];
      if (Number(buyOrder.price) >= Number(sellOrder.price)) {
        const tradeSize = Math.min(
          Number(buyOrder.size),
          Number(sellOrder.size)
        );
        const totalPrice = Number(sellOrder.price) * tradeSize;
        instructions.push({
          username: buyOrder.username,
          asset: "ETH",
          amount: tradeSize,
        });
        instructions.push({
          username: buyOrder.username,
          asset: "USDT",
          amount: -totalPrice,
        });
        instructions.push({
          username: sellOrder.username,
          asset: "ETH",
          amount: -tradeSize,
        });
        instructions.push({
          username: sellOrder.username,
          asset: "USDT",
          amount: totalPrice,
        });

        buyOrder.size = buyOrder.size - tradeSize;
        sellOrder.size = sellOrder.size - tradeSize;

        if (Number(buyOrder.size) === 0) {
          orderUpdates.push({ id: buyOrder.id, size: 0, status: "closed" });
          i++;
        } else {
          orderUpdates.push({ id: buyOrder.id, size: Number(buyOrder.size) });
        }
        if (Number(sellOrder.size) === 0) {
          orderUpdates.push({ id: sellOrder.id, size: 0, status: "closed" });
          j++;
        } else {
          orderUpdates.push({ id: sellOrder.id, size: Number(sellOrder.size) });
        }
      } else {
        j++;
      }
    }

    for (const update of orderUpdates) {
      if (update.status === "closed") {
        await client.query(
          "UPDATE orders SET size = 0, status = 'closed' WHERE id = $1",
          [update.id]
        );
      } else {
        await client.query("UPDATE orders SET size = $1 WHERE id = $2", [
          update.size,
          update.id,
        ]);
      }
    }

    await client.query("COMMIT");

    const updatedBuyOrdersResult = await client.query(
      "SELECT * FROM orders WHERE status = 'open' AND type = 'buy' ORDER BY price DESC, timestamp ASC"
    );
    const updatedSellOrdersResult = await client.query(
      "SELECT * FROM orders WHERE status = 'open' AND type = 'sell' ORDER BY price ASC, timestamp ASC"
    );

    orderBook.buyOrders = updatedBuyOrdersResult.rows;
    orderBook.sellOrders = updatedSellOrdersResult.rows;

    console.log(
      "Final Buy Orders:",
      JSON.stringify(orderBook.buyOrders, null, 2)
    );
    console.log(
      "Final Sell Orders:",
      JSON.stringify(orderBook.sellOrders, null, 2)
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error during order matching", err);
    throw err;
  } finally {
    client.release();
  }

  const userBalances: { [key: string]: { [asset: string]: number } } = {};
  for (const instruction of instructions) {
    const { username, asset, amount } = instruction;
    if (!userBalances[username]) {
      userBalances[username] = {};
    }
    if (!userBalances[username][asset]) {
      userBalances[username][asset] = 0;
    }
    userBalances[username][asset] += amount;
  }

  const userStates = Object.entries(userBalances).map(([username, assets]) => ({
    username,
    assets,
  }));

  return { userStates, orderBook };
}
