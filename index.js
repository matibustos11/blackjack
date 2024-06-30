// VARIABLES GLOBALES

let deck = [];
const tipos = ['T', 'C', 'D', 'P'];
const especiales = ['J', 'Q', 'K', 'A']
let puntosJugador = 0;
let puntosDealer = 0;

//REFERENCIAS DE HTML

const btnPedir = document.querySelector('#btnPedir');
const btnDetener = document.querySelector('#btnDetener');
const btnNuevo = document.querySelector('#btnNuevo');
const puntosHTML = document.querySelectorAll('small');
const divCartasJugador = document.querySelector('#jugador-cartas');
const divCartasDealer = document.querySelector('#dealer-cartas');


//Esta función crea una baraja nueva

const crearDeck = () => {

    for (i = 2 ; i <= 10 ; i++) {
        for(let tipo of tipos) {
            deck.push(i + tipo)
        }
    }

    for( let tipo of tipos) {
        for (let esp of especiales) {
            deck.push (esp + tipo)
        }
    }

    deck = _.shuffle(deck);   //Función shuffle de libreria underscore, permite "mezclar" un array aleatoriamente
    return deck

};

crearDeck();

// Esta función permite Tomar una carta y darsela al jugador o dealer, y sacarla del mazo, para que no vuelva a tocar

const pedirCarta = () => {

    if(deck.length === 0) {
        throw 'No hay cartas en la Baraja';  //Mensaje en consola
    }
    const carta = deck.pop();

    return carta
};

// Esta función valoriza cada carta

const valorCarta = (carta) => {

    const valor = carta.substring(0, carta.length -1);  //el método substring extrae el valor desde 0 hasta el valor que yo le indique
    return ( isNaN(valor) ) ?
            (valor === 'A') ? 11 : 10
            : valor * 1; //Multiplicamos por 1 el valor si recibe un número porque lo recibe como 'string', y así lo transformamos a número

};

// TURNO DEALER

const turnoDealer = (puntosMinimos) => {

    do {
        const carta = pedirCarta();

    puntosDealer = puntosDealer + valorCarta (carta) ;
    puntosHTML[1].innerText = puntosDealer;

    const imgCarta = document.createElement('img');
    imgCarta.src = `./assets/cartas/${carta}.png`;
    imgCarta.className = 'carta';
    divCartasDealer.append(imgCarta);

        if (puntosMinimos > 21){
            break;
        }

    } while (( puntosDealer < puntosMinimos) && (puntosDealer <= 21));

    setTimeout ( () => {        //Esta función de JS permite que el codigo de su interior se ejecute un tiempo después de que finalizó el anterior, en este caso, 50ms despues.
        let resultado = 0

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
    }, 50 );

};


//Eventos y funciones de los botones 

btnPedir.addEventListener('click', () => {

    const carta = pedirCarta();

    puntosJugador = puntosJugador + valorCarta (carta) ;
    puntosHTML[0].innerText = puntosJugador;

    const imgCarta = document.createElement('img');
    imgCarta.src = `./assets/cartas/${carta}.png`;
    imgCarta.className = 'carta';
    divCartasJugador.append(imgCarta);

    if ( puntosJugador > 21 ) {
        console.warn ('Lo siento, perdiste!!');
        btnPedir.disabled = true;
        btnDetener.disabled = true;
        turnoDealer(puntosJugador);

    } else if ( puntosJugador === 21) {
        console.warn ('Llegaste a 21, excelente!!');
        btnPedir.disabled = true;
        btnDetener.disabled = true;
        turnoDealer(puntosJugador);
    }
});

btnDetener.addEventListener('click', () => {

    btnPedir.disabled = true;
    btnDetener.disabled = true;
    turnoDealer(puntosJugador);

});

btnNuevo.addEventListener('click', () => {
    deck = [];
    deck = crearDeck();

    puntosJugador = 0;
    puntosDealer = 0;

    puntosHTML[0].innerText = 0;
    puntosHTML[1].innerText = 0;

    divCartasJugador.innerHTML = '';
    divCartasDealer.innerHTML = '';

    btnPedir.disabled = false;
    btnDetener.disabled = false;
    


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

