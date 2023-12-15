'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-12-02T17:01:17.194Z',
    '2023-12-10T23:36:17.929Z',
    '2023-12-13T00:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T00:00:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////

const atualizarUI = function (currentAccount) {
  mostrarTransacoes(currentAccount);
  calcMostrarBalanco(currentAccount);
  calcMostrarSumario(currentAccount);
};

const formatMovementDate = function (date, locale) {
  const calcDiasPassados = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

  const daysPassed = calcDiasPassados(new Date(), date);

  if (daysPassed === 0) return 'Hoje';
  if (daysPassed === 1) return 'Ontem';
  if (daysPassed <= 7) return `${daysPassed} dias atrás`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const mostrarTransacoes = function (acc, ordenar = false) {
  containerMovements.innerHTML = '';

  const trans = ordenar
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  trans.forEach((transacao, i) => {
    const tipo = transacao > 0 ? 'deposito' : 'saque';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(transacao, acc.locale, acc.currency);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${tipo}">${i + 1} ${tipo}
      </div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}
      </div>
    </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcMostrarBalanco = function (conta) {
  conta.balance = conta.movements.reduce(
    (acc, transacao) => acc + transacao,
    0
  );

  labelBalance.textContent = formatCur(
    conta.balance,
    conta.locale,
    conta.currency
  );
};

const calcMostrarSumario = function (conta) {
  const entradas = conta.movements
    .filter(transacao => transacao > 0)
    .reduce((acc, transacao) => acc + transacao, 0);
  labelSumIn.textContent = labelBalance.textContent = formatCur(
    entradas,
    conta.locale,
    conta.currency
  );

  const saidas = conta.movements
    .filter(transacao => transacao < 0)
    .reduce((acc, transacao) => acc + transacao, 0);
  labelSumOut.textContent = labelBalance.textContent = formatCur(
    Math.abs(saidas),
    conta.locale,
    conta.currency
  );

  const juros = conta.movements
    .filter(transacao => transacao > 0)
    .map(transacao => (transacao * conta.interestRate) / 100)
    .filter(transacao => transacao >= 1)
    .reduce((acc, transacao) => acc + transacao, 0);
  labelSumInterest.textContent = labelBalance.textContent = formatCur(
    juros,
    conta.locale,
    conta.currency
  );
};

const criarUsername = function (contas) {
  contas.forEach(conta => {
    conta.username = conta.owner
      .split(' ')
      .map(nome => nome[0])
      .join('')
      .toLowerCase();
  });
};
criarUsername(accounts);

// Event handlers
let currentAccount;

// FAKE LOGIN
currentAccount = account1;
atualizarUI(currentAccount);
containerApp.style.opacity = 100;

// Experimentando a API INTL
const now = new Date();
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
};

labelDate.textContent = new Intl.DateTimeFormat(
  currentAccount.locale,
  options
).format(now);

// Login
btnLogin.addEventListener('click', function (event) {
  event.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === +inputLoginPin.value) {
    labelWelcome.textContent = `Olá de novo, ${
      currentAccount.owner.split(' ')[0]
    }!`;
    containerApp.style.opacity = 100;

    atualizarUI(currentAccount);

    const now = new Date();
    const dia = `${now.getDate()}`.padStart(2, 0);
    const mes = `${now.getMonth() + 1}`.padStart(2, 0);
    const ano = now.getFullYear();
    const hora = `${now.getHours()}`.padStart(2, 0);
    const minutos = `${now.getMinutes()}`.padStart(2, 0);
    labelDate.textContent = `${dia}/${mes}/${ano}, ${hora}:${minutos}`;

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur(); // Faz o elemento perder o foco
  } else {
    console.log('Username ou senha incorretas');
  }
});
// Transferência
btnTransfer.addEventListener('click', function (event) {
  event.preventDefault();
  const quantia = +inputTransferAmount.value;
  const contaReceptora = accounts.find(
    acc => inputTransferTo.value === acc?.username
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    quantia > 0 &&
    contaReceptora &&
    currentAccount.balance >= quantia &&
    contaReceptora?.username !== currentAccount.username
  ) {
    // Realizando a transferência
    currentAccount.movements.push(-quantia);
    contaReceptora.movements.push(quantia);

    currentAccount.movementsDates.push(new Date().toISOString());
    contaReceptora.movementsDates.push(new Date().toISOString());

    atualizarUI(currentAccount);
  }
});
// Fechar conta
btnClose.addEventListener('click', function (event) {
  event.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    accounts.splice(
      accounts.findIndex(acc => acc.username === currentAccount.username),
      1
    );
  }
  // Esconder UI
  containerApp.style.opacity = 0;
  labelWelcome.textContent = 'Entre para começar';

  inputCloseUsername.value = inputClosePin.value = '';
});
// Solicitar empréstimo
btnLoan.addEventListener('click', function (event) {
  event.preventDefault();

  const quantia = Math.floor(inputLoanAmount.value);

  if (
    quantia > 0 &&
    currentAccount.movements.some(transacao => transacao > quantia * 0.1)
  ) {
    currentAccount.movements.push(quantia);
    currentAccount.movementsDates.push(new Date().toISOString());

    atualizarUI(currentAccount);
  }
  inputLoanAmount.value = '';
});
// Ordenar transações
let sorteado = false;

btnSort.addEventListener('click', function (event) {
  event.preventDefault();
  mostrarTransacoes(currentAccount.movements, !sorteado);
  sorteado = !sorteado;
});

// AULA
23 === 23.0;
// Base 10 - 0 a 9
// Binary base 2 - 0 1
0.1 + 0.2;
0.1 + 0.2 === 0.3;

Number('23');
+'23';

// Parsing
Number.parseInt('30px', 10);
Number.parseInt('e32', 10); // NaN
parseFloat('    2.5rem   ');
parseInt('2.5rem');

// isNaN
isNaN('Abc');
isNaN('23');
// isFinite
Number.isFinite(20);
Number.isFinite(+'20X');

// Math
Math.sqrt(25);
25 ** (1 / 2); // sqrt
8 ** (1 / 3); // raiz cubica

Math.max(5, 2, 3, 7, 8, 1);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
randomInt(1, 6);

// Arredondando inteiros
Math.trunc(11.24); // remove qualquer parte decimal
Math.round(23.8); // Arredonda
Math.ceil(23.3); // Arredonda para cima
Math.floor(23.9); // Arredonda para baixo

// Arredondando decimais
(2.745).toFixed(2);

const isEven = n => n % 2 === 0;

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (isEven(i)) {
      row.style.backgroundColor = 'orangered';
    }
  });
});

// 287,460,000,000 - Separadores numéricos - Underscore
const diameter = 287_460_000_000;

// Trabalhando com datas
const future = new Date(2037, 10, 19, 15, 23);
console.log(+future); // transforma a data em timestamp

// Internacionalização de números
const opcoes = {
  style: 'currency',
  currency: 'EUR',
};

const num = 366782.23;
console.log(new Intl.NumberFormat('pt-BR', opcoes).format(num));
