//input search functionality
const searchInput = document.querySelector(".choose-chash__input");
let allCash = [];

searchInput.addEventListener("input", e => {
  const chashCodesWrapper = document.querySelector(".choose-cash__cash");
  const toLowerCaseValue = e.target.value.toLowerCase();

  const matchedCodes = allCash.filter(code =>
    code.dataset["code"].toLowerCase().includes(toLowerCaseValue),
  );

  //remove all data
  chashCodesWrapper.innerHTML = "";

  //create new data
  matchedCodes.forEach(match => {
    chashCodesWrapper.appendChild(match);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  axios
    .get("https://api.exchangeratesapi.io/latest?base=PLN")
    .then(res => {
      const allCashashWrapper = document.querySelector(".choose-cash__cash");

      //change object to array so it can be  iterable
      const arrayRates = Object.entries(res.data.rates);

      arrayRates.forEach(rate => {
        if (rate[0] !== "PLN") {
          //array of single element looks like this: [property, value], in this case: [cashcode, rate value]
          const singleCashWrapper = document.createElement("div");
          const codeValueSpan = document.createElement("span");
          const rateValueSpan = document.createElement("span");

          codeValueSpan.textContent = rate[0] + ": ";
          rateValueSpan.textContent = rate[1].toFixed(2);

          singleCashWrapper.dataset.code = rate[0];
          singleCashWrapper.classList.add("choose-cash__chash-code");

          singleCashWrapper.addEventListener("click", chooseCash);

          //display it
          singleCashWrapper.append(codeValueSpan, rateValueSpan);
          allCashashWrapper.appendChild(singleCashWrapper);
        }
      });

      //set all cash code to variable so it can be filtered
      allCash = Array.from(document.querySelectorAll(".choose-cash__chash-code"));
    })
    .catch(err => console.log(err));
});

function chooseCash(e) {
  const cashCode = e.currentTarget.dataset["code"];
  const chosenTitle = document.querySelector(".chosen-chash__code");

  //prevent from fetching same data
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
  function prevoiusMonday() {
    const prevMonday = new Date();
    const day = prevMonday.getDay();

    if (prevMonday.getDay() === 1) {
      //if day is a monday
      prevMonday.setDate(prevMonday.getDate() - 7);
    } else if (prevMonday.getDay() === 0) {
      //if day is a sunday
      prevMonday.setDate(prevMonday.getDate() - 6);
    } else {
      //other days
      prevMonday.setDate(prevMonday.getDate() - (day - 1));
    }

    return {
      prevMondayYear: prevMonday.getFullYear(),
      prevMondayMonth: setMonth(prevMonday.getMonth()),
      prevMondayDay: setDay(prevMonday.getDate()),
    };
  }
  const {prevMondayYear, prevMondayMonth, prevMondayDay} = prevoiusMonday();

  console.log(prevMondayYear, prevMondayMonth, prevMondayDay);

  //current date
  const date = new Date();
  const year = date.getFullYear();
  const month = setMonth(date.getMonth());
  const day = setDay(date.getDate());

  const getRatesFromTodayToPreviousMonday = `https://api.exchangeratesapi.io/history?start_at=${prevMondayYear}-${prevMondayMonth}-${prevMondayDay}&end_at=${year}-${month}-${day}&base=PLN&symbols=${cashCode}`;

  axios
    .get(getRatesFromTodayToPreviousMonday)
    .then(res => {
      const dates = res.data.rates;
      const arrayDates = Object.entries(dates);

      const datesWrapper = document.querySelector(".chosen-cash__dates");
      //replace dates to new ones
      datesWrapper.firstChild && (datesWrapper.innerHTML = "");

      //create all dates
      arrayDates.forEach(date => {
        const singleDateWrapper = document.createElement("div");
        singleDateWrapper.classList.add("chosen-cash__date");

        const dateValueSpan = document.createElement("span");
        dateValueSpan.classList.add("chosen-cash__date-value");

        const rateValueSpan = document.createElement("span");
        rateValueSpan.classList.add("chosen-cash__date-rate");

        //get value of rate in the certain date by using cashCode
        const cashValue = date[1][cashCode];

        dateValueSpan.textContent = date[0] + ": ";
        rateValueSpan.textContent = cashValue;

        singleDateWrapper.append(dateValueSpan, rateValueSpan);
        datesWrapper.appendChild(singleDateWrapper);
      });
    })
    .catch(err => console.log(err));
}
