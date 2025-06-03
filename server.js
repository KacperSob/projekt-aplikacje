const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;
const filePath = 'bookings.txt';


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/book', (req, res) => {
  const booking = req.body;

  const checkinNew = new Date(booking.checkin);
  const checkoutNew = new Date(booking.checkout);

  let existingBookings = [];
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
    existingBookings = lines.map(line => JSON.parse(line));
  }

  const conflict = existingBookings.some(b => {
    if (b.room !== booking.room) return false;
    const checkin = new Date(b.checkin);
    const checkout = new Date(b.checkout);
    return !(checkout <= checkinNew || checkin >= checkoutNew);
  });

  if (conflict) {
    return res.send(`
      <h2>Przepraszamy, ten pokój jest już zajęty na te daty.</h2>
      <a href="/">Sprobuj inną datę!</a>
    `);
  }

  fs.appendFileSync('bookings.txt', JSON.stringify(booking) + '\n');

  res.send(`
    <h2>${booking.name}!</h2>
    <p>Twoja rezerwacja na pokój ${booking.room} od ${booking.checkin} do ${booking.checkout} została zapisana!.</p>
    <a href="/">Powrót</a>
  `);
});

app.get('/baza', (req, res) => {

    res.sendFile(__dirname + '/bookings.txt', (err) => {
        if(err){
            res.send(`
                    <h2>Baza danych jest pusta! Brak pliku</h2>
                    <a href="/">Powrót</a>
                `);
        }
    });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
