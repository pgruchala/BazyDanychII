const app = require("./src/app");
const prisma = require("./src/utils/prisma");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Sprawdź połączenie z bazą danych wykonując zapytanie testowe
    await prisma.$queryRaw`SELECT 1`;
    console.log("Połączenie z bazą danych zostało pomyślnie nawiązane.");

    // Uruchomienie serwera Express
    app.listen(PORT, () => {
      console.log(`Serwer działa na porcie ${PORT}`);
      console.log(`API dostępne pod adresem http://localhost:${PORT}/products`);
    });
  } catch (error) {
    console.error("Nie można uruchomić serwera:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Obsługa czystego zamknięcia
process.on("SIGINT", async () => {
  console.log("Zamykanie połączenia z bazą danych...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
