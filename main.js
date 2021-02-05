//input search functionality
const searchInput = document.querySelector(".choose-chash__input");
let chashCodes = [];

searchInput.addEventListener("input", e => {
  const chashCodesWrapper = document.querySelector(".choose-cash__cash");
  const toLowerCaseValue = e.target.value.toLowerCase();

  const matchCodes = chashCodes.filter(code =>
    code.dataset["code"].toLowerCase().includes(toLowerCaseValue),
  );

  //remove all data
  chashCodesWrapper.innerHTML = "";

  //create new data
  matchCodes.forEach(match => {
    chashCodesWrapper.appendChild(match);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  axios
    .get("https://api.exchangeratesapi.io/latest?base=PLN")
    .then(res => {
      const cashWrapper = document.querySelector(".choose-cash__cash");

      //change object to array so it can be  iterable
      const arrayRates = Object.entries(res.data.rates);

      arrayRates.forEach(rate => {
        if (rate[0] !== "PLN") {
          //array of single element looks like this: [property, value], in this case: [cashcode, rate value]
          const cash = document.createElement("div");
          const codeSpan = document.createElement("span");
          const valueSpan = document.createElement("span");

          codeSpan.textContent = rate[0] + ": ";
          valueSpan.textContent = rate[1].toFixed(2);

          cash.dataset.code = rate[0];
          cash.classList.add("choose-cash__chash-code");

          cash.addEventListener("click", chooseCash);

          //display it
          cash.append(codeSpan, valueSpan);
          cashWrapper.appendChild(cash);
        }
      });

      //set all cash code to variable so it can be filtered
      chashCodes = Array.from(document.querySelectorAll(".choose-cash__chash-code"));
    })
    .catch(err => console.log(err));
});

function chooseCash(e) {
  const cashCode = e.currentTarget.dataset["code"];
  const chosenTitle = document.querySelector(".chosen-chash__code");

  if (cashCode === chosenTitle.textContent) return;

  chosenTitle.textContent = cashCode;

  function setMonth(month) {
    month++;
    if (month < 10) {
      month = "0" + month;
    }
    return month;
  }

  function setDay(day) {
    if (day < 10) {
      day = "0" + day;
    }
    return day;
  }

  //previous monday
  function prevoiusMondayYear() {
    var date = new Date();
    var day = date.getDay();
    var prevMonday = new Date();
    if (date.getDay() == 0) {
      prevMonday.setDate(date.getDate() - 7);
    } else {
      prevMonday.setDate(date.getDate() - (day - 1));
    }

    return {
      prevMondayYear: prevMonday.getFullYear(),
      prevMondayMonth: setMonth(prevMonday.getMonth()),
      prevMondayDay: setDay(prevMonday.getDay()),
    };
  }
  const {prevMondayYear, prevMondayMonth, prevMondayDay} = prevoiusMondayYear();

  //current date
  const date = new Date();
  const year = date.getFullYear();
  const month = setMonth(date.getMonth());
  const day = setDay(date.getDay());

  const getRateFromTodayToPreviousMonday = `https://api.exchangeratesapi.io/history?start_at=${prevMondayYear}-${prevMondayMonth}-${prevMondayDay}&end_at=${year}-${month}-${day}&base=PLN&symbols=${cashCode}`;

  axios
    .get(getRateFromTodayToPreviousMonday)
    .then(res => {
      const dates = res.data.rates;
      const arrayDates = Object.entries(dates);

      const datesWrapper = document.querySelector(".chosen-cash__dates");
      datesWrapper.firstChild && (datesWrapper.innerHTML = "");

      arrayDates.forEach(date => {
        const dateWrapper = document.createElement("div");

        const dateValueSpan = document.createElement("span");
        const cashValueSpan = document.createElement("span");

        //get value of rate in the certain date by using cashCode
        const cashValue = date[1][cashCode];

        dateValueSpan.textContent = date[0] + ": ";
        cashValueSpan.textContent = cashValue;

        dateWrapper.append(dateValueSpan, cashValueSpan);
        datesWrapper.appendChild(dateWrapper);
      });
    })
    .catch(err => console.log(err));
}
