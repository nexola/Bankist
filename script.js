'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

const mostrarTransacoes = function (transacoes) {
  containerMovements.innerHTML = '';

  transacoes.forEach((transacao, i) => {
    const tipo = transacao > 0 ? 'deposito' : 'saque';

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${tipo}">${i + 1} ${tipo}
      </div>
      <div class="movements__value">${transacao}€
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
  labelBalance.textContent = `${conta.balance}€`;
};

const calcMostrarSumario = function (conta) {
  const entradas = conta.movements
    .filter(transacao => transacao > 0)
    .reduce((acc, transacao) => acc + transacao, 0);
  labelSumIn.textContent = `${entradas}€`;

  const saidas = conta.movements
    .filter(transacao => transacao < 0)
    .reduce((acc, transacao) => acc + transacao, 0);
  labelSumOut.textContent = `${Math.abs(saidas)}€`;

  const juros = conta.movements
    .filter(transacao => transacao > 0)
    .map(transacao => (transacao * conta.interestRate) / 100)
    .filter(transacao => transacao >= 1)
    .reduce((acc, transacao) => acc + transacao, 0);
  labelSumInterest.textContent = `${juros}€`;
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
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
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
  const quantia = Number(inputTransferAmount.value);
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
    Number(inputClosePin.value) === currentAccount.pin
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

  const quantia = Number(inputLoanAmount.value);

  if (
    quantia > 0 &&
    currentAccount.movements.some(transacao => transacao > quantia * 0.1)
  ) {
    currentAccount.movements.push(quantia);
    atualizarUI(currentAccount);
    inputLoanAmount.value = '';
  }
});
