//input search functionality
var searchInput = document.querySelector(".choose-chash__input");
var allCash = [];

searchInput.addEventListener("input", e => {
  var chashCodesWrapper = document.querySelector(".choose-cash__cash");
  var toLowerCaseValue = e.target.value.toLowerCase();

  var matchedCodes = allCash.filter(code =>
    code.dataset["code"].toLowerCase().includes(toLowerCaseValue),
  );

  //remove all data
  chashCodesWrapper.innerHTML = "";

  //display matched codes
  matchedCodes.forEach(match => {
    chashCodesWrapper.appendChild(match);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  axios
    .get("https://api.exchangeratesapi.io/latest?base=PLN")
    .then(res => {
      var allCashashWrapper = document.querySelector(".choose-cash__cash");

      //change object to array so it can be  iterable
      var arrayRates = Object.entries(res.data.rates);

      arrayRates.forEach(rate => {
        if (rate[0] !== "PLN") {
          //array of single element looks like this: [property, value], in this case: [cashcode, rate value]
          var singleCashWrapper = document.createElement("div");
          var codeValueSpan = document.createElement("span");
          var rateValueSpan = document.createElement("span");

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
  var cashCode = e.currentTarget.dataset["code"];
  var chosenTitle = document.querySelector(".chosen-chash__code");

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
    var prevMonday = new Date();
    var day = prevMonday.getDay();

    if (prevMonday.getDay() === 0) {
      //if day is a sunday
      prevMonday.setDate(prevMonday.getDate() - 13);
    } else {
      //other days
      prevMonday.setDate(prevMonday.getDate() - day - 6);
    }

    return {
      year: prevMonday.getFullYear(),
      month: setMonth(prevMonday.getMonth()),
      day: setDay(prevMonday.getDate()),
    };
  }
  var prevoiusMonday = prevoiusMonday();

  //current date
  var date = new Date();
  var year = date.getFullYear();
  var month = setMonth(date.getMonth());
  var day = setDay(date.getDate());

  var getRatesFromTodayToPreviousMonday = `https://api.exchangeratesapi.io/history?start_at=${prevoiusMonday.year}-${prevoiusMonday.month}-${prevoiusMonday.day}&end_at=${year}-${month}-${day}&base=PLN&symbols=${cashCode}`;

  axios
    .get(getRatesFromTodayToPreviousMonday)
    .then(res => {
      var dates = res.data.rates;
      var arrayDates = Object.entries(dates);

      var datesWrapper = document.querySelector(".chosen-cash__dates");

      //remove previous rates
      datesWrapper.innerHTML = "";

      //create all rates
      arrayDates.forEach(date => {
        var singleDateWrapper = document.createElement("div");
        singleDateWrapper.classList.add("chosen-cash__date");

        var dateValueSpan = document.createElement("span");
        dateValueSpan.classList.add("chosen-cash__date-value");

        var rateValueSpan = document.createElement("span");
        rateValueSpan.classList.add("chosen-cash__date-rate");

        //get value of a rate in the certain date by using cashCode
        var cashValue = date[1][cashCode];

        dateValueSpan.textContent = date[0] + ": ";
        rateValueSpan.textContent = cashValue;

        singleDateWrapper.append(dateValueSpan, rateValueSpan);
        datesWrapper.appendChild(singleDateWrapper);
      });
    })
    .catch(err => console.log(err));
}
