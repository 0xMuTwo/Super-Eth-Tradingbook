export default function Home() {
  return (
    <main className="min-h-screen grid grid-rows-8 grid-cols-5">
      <div className="bg-green-600 col-span-5">User Info</div>
      <div className="bg-red-300 row-start-2 row-span-8 col-span-3">
        Orderbook
      </div>
      <div className="bg-blue-400 row-start-2 row-span-8 col-span-2">
        Trading Interface
      </div>
    </main>
  );
}
