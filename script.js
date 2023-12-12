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
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
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
    '2020-07-26T12:01:20.894Z',
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
  mostrarTransacoes(currentAccount.movements);
  calcMostrarBalanco(currentAccount);
  calcMostrarSumario(currentAccount);
};

const mostrarTransacoes = function (transacoes, ordenar = false) {
  containerMovements.innerHTML = '';

  const trans = ordenar ? transacoes.slice().sort((a, b) => a - b) : transacoes;

  trans.forEach((transacao, i) => {
    const tipo = transacao > 0 ? 'deposito' : 'saque';

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${tipo}">${i + 1} ${tipo}
      </div>
      <div class="movements__value">${transacao.toFixed(2)}€
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
  labelBalance.textContent = `${conta.balance.toFixed(2)}€`;
};

const calcMostrarSumario = function (conta) {
  const entradas = conta.movements
    .filter(transacao => transacao > 0)
    .reduce((acc, transacao) => acc + transacao, 0);
  labelSumIn.textContent = `${entradas.toFixed(2)}€`;

  const saidas = conta.movements
    .filter(transacao => transacao < 0)
    .reduce((acc, transacao) => acc + transacao, 0);
  labelSumOut.textContent = `${Math.abs(saidas).toFixed(2)}€`;

  const juros = conta.movements
    .filter(transacao => transacao > 0)
    .map(transacao => (transacao * conta.interestRate) / 100)
    .filter(transacao => transacao >= 1)
    .reduce((acc, transacao) => acc + transacao, 0);
  labelSumInterest.textContent = `${juros.toFixed(2)}€`;
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
    atualizarUI(currentAccount);
    inputLoanAmount.value = '';
  }
});
// Ordenar transações
let sorteado = false;

btnSort.addEventListener('click', function (event) {
  event.preventDefault();
  mostrarTransacoes(currentAccount.movements, !sorteado);
  sorteado = !sorteado;
});

// AULA
console.log(23 === 23.0);
// Base 10 - 0 a 9
// Binary base 2 - 0 1
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

console.log(Number('23'));
console.log(+'23');

// Parsing
console.log(Number.parseInt('30px', 10));
console.log(Number.parseInt('e32', 10)); // NaN
console.log(parseFloat('    2.5rem   '));
console.log(parseInt('2.5rem'));

// isNaN
console.log(isNaN('Abc'));
console.log(isNaN('23'));
// isFinite
console.log(Number.isFinite(20));
console.log(Number.isFinite(+'20X'));

// Math
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2)); // sqrt
console.log(8 ** (1 / 3)); // raiz cubica

console.log(Math.max(5, 2, 3, 7, 8, 1));

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
console.log(randomInt(1, 6));

// Arredondando inteiros
console.log(Math.trunc(11.24)); // remove qualquer parte decimal
console.log(Math.round(23.8)); // Arredonda
console.log(Math.ceil(23.3)); // Arredonda para cima
console.log(Math.floor(23.9)); // Arredonda para baixo

// Arredondando decimais
console.log((2.745).toFixed(2));

const isEven = n => n % 2 === 0;

console.log(isEven(8));
console.log(isEven(3));
console.log(isEven(6));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (isEven(i)) {
      row.style.backgroundColor = 'orangered';
    }
  });
});
