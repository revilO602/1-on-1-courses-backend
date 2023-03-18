## Opis

Táto mobilná aplikácia umožňuje používateľom vytvárať kurzy s hodinovými “one on one” lekciami, ktoré sa opakujú každý týždeň v rovnakom čase. Následne sa iný používatelia môžu prihlásiť na voľný časový blok (timeslot). Používateľ si potom môže zobraziť svoj rozvrh. Súčasťou aplikácie sú “one on one” lekcie formou videohovorov medzi učiteľom a študentom.

## Backend

REST API pre mobilnú aplikáciu bolo vytvorené v **Javascripte** s použitím webového servera **Node.js** a rámca **express.js**. Databázu sme zvolili **postgresql** a použili sme ORM **sequelize** na komunikáciu serveru s databázou a validáciu dát poslaných na server. Databáza aj webový server beží iba na lokálnom stroji a dá sa na server pripojiť z iného zariadenia. Na autentifikáciu používateľov sme použili knižnicu **express-basic-auth**.

_/database_ \
Vytvorenie prepojenia s databázou pre sequelize ORM a vloženie predvolených dát.

_/helpers_ \
Predstavuje pomocné funkcie používané na viacerých miestach. Najmä tu je riešené testovanie prekrývajúcich sa timeslotov - takéto timesloty nepovoľujeme používateľom tvoriť.

_/media_ \
Používateľmi uploadnuté súbory.

_/middleware_ \
Vlastný middleware

_/models_ \
ORM reprezentácie databázových tabuliek.

_/routes_ \
Spracovanie požiadaviek na jednotlivé URL adresy.

_/server.js_ \
Smerovanie požiadaviek do správnych súborov v priečinku _/routes_.

Pre spustenie backendu je potrebné najprv spustiť príkaz `npm install` a potom `npm start`. Backend beží na lokalnej adrese http://localhost:3000 . Pri spustení na Wi-Fi pripojení sa vypíše do konzoly adresa dostupná externému zariadeniu na tej istej Wi-Fi.

### Dátový model
![physical_model.png](docs%2Fimages%2Fphysical_model.png)
### REST API volania

Swagger 2.0 dokumentácia: https://app.swaggerhub.com/apis-docs/revilO6024/MTAA/1.1.0

**POST 	/users/register** - Registrácia \
**GET	/users/login - Login** - prihlasovacie údaje sa posielajú v headeri requestu \
**POST 	/courses**  - Vytvorenie kurzu \
**GET	/courses**  - Vrátenie zoznamu voľných kurzov s vyhľadávaním a filtrovaním \
    /courses/?categoryId=1 \
    /courses/?q=math \
**GET 	/courses/<:id>** - Detail kurzu \
**PUT	/courses/<:id>** - Zmeniť informácie kurzu \
**DEL	/courses/<:id>** - Vymazanie kurzu \
**DEL	/courses/<:id>/timeslots/<:id>** - Vymazanie timeslotu z kurzu \
**POST	/courses/<:id>/timeslots** - Pridanie timeslotu ku kurzu \
**POST	/courses/join** - Pridanie sa ku kurzu (súčasťou request body je pole vybraných
timeslot ID -  timeslot rovno definuje aj o ktorý kurz sa jedná) \
**POST	/courses/leave** - Odhlásenie sa z timeslotov kurzu (súčasťou request body je pole
vybraných timeslot ID -  timeslot rovno definuje aj o ktorý kurz sa jedná) \
**GET 	/courses/categories** - Vrátenie listu kategórií kurzov \
**GET 	/courses/<:id>/students** - Vrátenie listu študentov kurzu \
**GET 	/courses/<:id>/materials** - Zoznam materiálov pre kurz \
**GET 	/media/<:file_path>** - Stiahnutie materiálu \
**POST 	/courses/<:id>/materials** - Upload materiálu pre kurz \
**GET 	/timetable** - List timeslotov, v ktorých má user kurzy \
**GET 	/student/courses** - List kurzov kde user je študent \
**GET 	/student/courses/<:id>** - Detail kurzu kde user je študent \
**GET 	/teacher/courses** - List kurzov kde user je učiteľ \
**GET 	/teacher/courses/<:id>** - Detail kurzu kde user je učiteľ \
