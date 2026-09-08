const guessTheNameUrl = process.env.NEXT_PUBLIC_GUESS_THE_NAME_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");

export const metadata = {
  title: "Guess the Name | Kids Play Portal",
  description: "Play a name guessing game from the Kids Play Portal.",
};

export default function GuessTheNamePage() {
  return (
    <main className="external-app-route guess-route">
      {guessTheNameUrl ? (
        <iframe
          title="Guess the Name"
          className="external-app-frame"
          src={guessTheNameUrl}
        />
      ) : (
        <section className="external-app-missing" aria-label="Guess the Name setup">
          <p className="eyebrow">Game app</p>
          <h1>Guess the Name</h1>
          <p>
            Guess the Name is ready to connect from the portal.
          </p>
          <a className="back-button" href="/">Back to Portal</a>
        </section>
      )}
    </main>
  );
}
