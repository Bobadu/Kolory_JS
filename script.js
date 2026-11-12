const form = document.getElementById("ustawienia");
const plansza = document.getElementById("plansza");
const info = document.getElementById("info");
const pokazKody = document.getElementById("pokazKody");
const przyciskPauza = document.getElementById("pauza");

let komorki = [];
let interwal = null;
let licznikZmian = 0;

function wymieszaj(tablica) {
    for (let i = tablica.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tablica[i], tablica[j]] = [tablica[j], tablica[i]];
    }
    return tablica;
}

function hslNaHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const skladowa = n => {
        const k = (n + h / 30) % 12;
        const wartosc = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        return Math.round(wartosc * 255).toString(16).padStart(2, "0");
    };
    return "#" + skladowa(0) + skladowa(8) + skladowa(4);
}

function czyJasny(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

function zmienKolory() {
    const uzyte = new Set();
    const przesuniecie = Math.random() * 360;
    const krok = 360 / komorki.length;
    const kolejnosc = wymieszaj([...komorki.keys()]);

    komorki.forEach((komorka, i) => {
        const odcien = (przesuniecie + kolejnosc[i] * krok) % 360;
        let kolor;

        do {
            const nasycenie = 60 + Math.random() * 35;
            const jasnosc = 42 + Math.random() * 24;
            kolor = hslNaHex(odcien, nasycenie, jasnosc);
        } while (uzyte.has(kolor) || kolor === komorka.dataset.kolor);

        uzyte.add(kolor);
        komorka.dataset.kolor = kolor;
        komorka.style.backgroundColor = kolor;
        komorka.style.color = czyJasny(kolor) ? "#111" : "#fff";
        komorka.title = kolor;
        komorka.firstChild.textContent = kolor;
    });

    licznikZmian++;
    info.textContent = `Pól: ${komorki.length} • każde ma inny kolor • zmiana nr ${licznikZmian}`;
}

function uruchom() {
    clearInterval(interwal);
    interwal = setInterval(zmienKolory, 1000);
    przyciskPauza.textContent = "Pauza";
}

function stworzPlansze(wiersze, kolumny) {
    plansza.innerHTML = "";
    plansza.style.gridTemplateColumns = `repeat(${kolumny}, 1fr)`;
    plansza.style.width = `min(100%, calc(70vh * ${kolumny} / ${wiersze}), 860px)`;
    plansza.style.aspectRatio = `${kolumny} / ${wiersze}`;

    komorki = [];
    for (let i = 0; i < wiersze * kolumny; i++) {
        const komorka = document.createElement("div");
        komorka.className = "komorka";
        komorka.appendChild(document.createElement("span"));
        plansza.appendChild(komorka);
        komorki.push(komorka);
    }

    licznikZmian = 0;
    przyciskPauza.disabled = false;
    zmienKolory();
    uruchom();
}

form.addEventListener("submit", e => {
    e.preventDefault();
    const wiersze = Number(document.getElementById("wiersze").value);
    const kolumny = Number(document.getElementById("kolumny").value);

    if (!Number.isInteger(wiersze) || !Number.isInteger(kolumny) || wiersze < 1 || kolumny < 1 || wiersze > 40 || kolumny > 40) {
        info.textContent = "Wymiary muszą być liczbami całkowitymi od 1 do 40";
        info.classList.add("blad");
        return;
    }

    info.classList.remove("blad");
    stworzPlansze(wiersze, kolumny);
});

pokazKody.addEventListener("change", () => {
    plansza.classList.toggle("kody", pokazKody.checked);
});

przyciskPauza.addEventListener("click", () => {
    if (interwal) {
        clearInterval(interwal);
        interwal = null;
        przyciskPauza.textContent = "Wznów";
    } else {
        uruchom();
    }
});
