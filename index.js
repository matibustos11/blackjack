
// VARIABLES GLOBALES
let deckId = null;
let puntosJugador = 0;
let puntosDealer = 0;

//REFERENCIAS DE HTML
const btnPedir = document.querySelector('#btnPedir');
const btnDetener = document.querySelector('#btnDetener');
const btnNuevo = document.querySelector('#btnNuevo');
const puntosHTML = document.querySelectorAll('small');
const divCartasJugador = document.querySelector('#jugador-cartas');
const divCartasDealer = document.querySelector('#dealer-cartas');

// Esta función permite Tomar una carta y darsela al jugador o dealer, y sacarla del mazo, para que no vuelva a tocar
const pedirCarta = async () => {
    if (deckId === null) {
        throw 'No hay mazo disponible';
    }

    try {
        const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
        const data = await response.json();
        if (data.success) {
            return data.cards[0];
        } else {
            throw new Error('No hay más cartas en el mazo');
        }
    } catch (error) {
        console.error(error);
    }
};

// Esta función valoriza cada carta
const valorCarta = (valor) => {
    if (isNaN(valor)) {
        return (valor === 'A') ? 11 : 10;
    } else {
        return parseInt(valor);
    }
};

// TURNO DEALER
const turnoDealer = async (puntosMinimos) => {
    do {
        const carta = await pedirCarta();
        puntosDealer += valorCarta(carta.value);
        puntosHTML[1].innerText = puntosDealer;

        const imgCarta = document.createElement('img');
        imgCarta.src = carta.image;
        imgCarta.className = 'carta';
        divCartasDealer.append(imgCarta);

        if (puntosMinimos > 21) {
            break;
        }

    } while ((puntosDealer < puntosMinimos) && (puntosDealer <= 21));

    setTimeout(() => {
        let resultado = 0;
        if (puntosMinimos === puntosDealer) {
            resultado = 'Perdiste.';
            Swal.fire({
                icon: "error",
                title: `${resultado}`,
                text: "Mejor suerte para la próxima :)",
            });
        } else if (puntosDealer > 21) {
            resultado = 'Ganaste!!';
            Swal.fire({
                title: `${resultado}`,
                text: "Muy bien! Venciste al dealer.",
                icon: "success",
            });
        } else {
            resultado = 'Perdiste.';
            Swal.fire({
                icon: "error",
                title: `${resultado}`,
                text: "Mejor suerte para la próxima :)",
            });
        }

        // Guarda el juego en el historial
        const nuevoJuego = {
            fecha: new Date(),
            resultado: resultado,
            puntosJugador: puntosJugador,
            puntosDealer: puntosDealer
        };
        guardarJuegoEnHistorial(nuevoJuego);
    }, 50);
};

//Eventos y funciones de los botones
btnPedir.addEventListener('click', async () => {
    const carta = await pedirCarta();
    if (carta) {
        puntosJugador += valorCarta(carta.value);
        puntosHTML[0].innerText = puntosJugador;

        const imgCarta = document.createElement('img');
        imgCarta.src = carta.image;
        imgCarta.className = 'carta';
        divCartasJugador.append(imgCarta);

        if (puntosJugador > 21) {
            console.warn('Lo siento, perdiste!!');
            btnPedir.disabled = true;
            btnDetener.disabled = true;
            turnoDealer(puntosJugador);
        } else if (puntosJugador === 21) {
            console.warn('Llegaste a 21, excelente!!');
            btnPedir.disabled = true;
            btnDetener.disabled = true;
            turnoDealer(puntosJugador);
        }
    }
});

btnDetener.addEventListener('click', () => {
    btnPedir.disabled = true;
    btnDetener.disabled = true;
    turnoDealer(puntosJugador);
});

btnNuevo.addEventListener('click', async () => {
    puntosJugador = 0;
    puntosDealer = 0;

    puntosHTML[0].innerText = 0;
    puntosHTML[1].innerText = 0;

    divCartasJugador.innerHTML = '';
    divCartasDealer.innerHTML = '';

    btnPedir.disabled = false;
    btnDetener.disabled = false;

    // Obtener un nuevo mazo
    try {
        const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
        const data = await response.json();
        deckId = data.deck_id;
    } catch (error) {
        console.error('Error al crear un nuevo mazo:', error);
    }
});

// Funciones para guardar y mostrar el historial de juegos
const guardarJuegoEnHistorial = (juego) => {
    const historial = JSON.parse(localStorage.getItem('historialJuegosBlackjack')) || [];
    historial.push(juego);
    localStorage.setItem('historialJuegosBlackjack', JSON.stringify(historial));
};

const mostrarHistorial = () => {
    const historial = JSON.parse(localStorage.getItem('historialJuegosBlackjack'));
    if (historial) {
        historial.forEach(juego => {
            console.log(`Juego del ${new Date(juego.fecha).toLocaleString()}: ${juego.resultado} (Jugador: ${juego.puntosJugador}, Dealer: ${juego.puntosDealer})`);
        });
    } else {
        console.log('No hay historial de juegos.');
    }
};

// Mostrar historial al cargar la página
window.addEventListener('load', mostrarHistorial);

// Inicializar el mazo al cargar la página
window.addEventListener('load', async () => {
    try {
        const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
        const data = await response.json();
        deckId = data.deck_id;
    } catch (error) {
        console.error('Error al crear un nuevo mazo:', error);
    }
});

