const Modal = {
  open() {
    //abrir modal
    //adicionar a class active ao modal
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    //fechar modal
    //retirar a class active do modal
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};
// PEGANDO NA MEMORIA DO NAVEGADOR (STORAGE) os items salvos com get e salvando eles dando SET
const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transaction")) || [];
  },
  set(transactions) {
    localStorage.setItem(
      "dev.finances:transaction",
      JSON.stringify(transactions)
    );
  },
};
// preciso pegar as minhas transações do meu objeto aqui no js e colocar no HMTL
const Transaction = {
  all: Storage.get(),
  add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },
  remove(index) {
    Transaction.all.splice(index, 1);
    App.reload();
  },
  incomes() {
    let income = 0;
    // Loop para soma de cada componete do ARRAY income (soma todos elementos amount positivos dentro da variavel income usando +=)
    Transaction.all.forEach((transactions) => {
      transactions.amount > 0 ? (income += transactions.amount) : "";
    });
    // formata o resultado para colocar no HTML
    return Utils.formatCurrency(income);
  },
  expenses() {
    let expense = 0;
    Transaction.all.forEach((transactions) => {
      transactions.amount < 0 ? (expense += transactions.amount) : "";
    });
    return Utils.formatCurrency(expense);
  },
  total() {
    // transforma income em uma string sem sinal e sem formatação
    let inc = String(Transaction.incomes()).replace(/\D/g, "");
    // força o income a ser um numero puro
    inc = Number(inc);
    // transforma expenses em uma string sem sinal e sem formatação
    let exp = String(Transaction.expenses()).replace(/\D/g, "");
    // força o expenses a ser um numero puro
    exp = Number(exp);
    result = inc - exp;
    // formata o resultado da conta
    return Utils.formatCurrency(result);
  },
};
const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),
  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    DOM.transactionsContainer.appendChild(tr);
  },
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
    <td class="description">${transaction.description}</td>
    <td class="${CSSclass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td>
        <img class="buttonminus" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
    </td>
    `;

    return html;
  },
  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Transaction.incomes();
    document.getElementById(
      "expenseDisplay"
    ).innerHTML = Transaction.expenses();
    document.getElementById("totalDisplay").innerHTML = Transaction.total();
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};
const Utils = {
  formatAmount(value) {
    value = Number(value) * 100;
    return value;
  },
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";
    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return signal + value;
  },
  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[02]}/${splittedDate[01]}/${splittedDate[0]}`;
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();
    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },
  formatValues() {
    let { description, amount, date } = Form.getValues();
    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);
    return { description, amount, date };
  },
  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    try {
      // valida os dados
      Form.validateFields();
      // formata os dados
      const transaction = Form.formatValues();
      // Adiciona os dados no ARRAY
      Transaction.add(transaction);
      // limpa os dados do Modal
      Form.clearFields();
      // Fecha o modal
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);
    DOM.updateBalance();
    Storage.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};
App.init();
