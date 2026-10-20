function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ridezo-bg px-6 text-gray-100">
      <section className="w-full max-w-md rounded-2xl border border-ridezo-border bg-ridezo-surface p-8">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-ridezo-primary font-bold text-gray-950">
          R
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Ridezo</h1>

        <p className="mt-3 leading-7 text-gray-400">
          Your journey starts here. Find rides, connect with people, and travel
          together.
        </p>

        <button
          type="button"
          className="mt-6 rounded-lg bg-ridezo-primary px-5 py-3 font-semibold text-gray-950 transition hover:brightness-110"
        >
          Get started
        </button>
      </section>
    </main>
  );
}

export default App;