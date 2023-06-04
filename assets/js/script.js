/*========================================= Mediator ==========================================*/
var eventsMediator = {
  events: {},
  on: function (eventName, callbackfn) {
    this.events[eventName] = this.events[eventName]
      ? this.events[eventName]
      : [];
    this.events[eventName].push(callbackfn);
  },
  emit: function (eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(function (callBackfn) {
        callBackfn(data);
      });
    }
  },
};

/*===================================== Movie Cards Module ===================================== */
var movieModule = {
  page: 1,
  cardData: [],

  init () {
    this.getcards();

    this.fetchImg(this.page);

    $(".next-page").on("click", () => {
      this.page++;
      eventsMediator.emit("changePage", this.page);
      this.fetchImg(this.page);
    });
    $(".previous-page").on("click", () => {
      if (this.page > 1) {
        this.page--;
        eventsMediator.emit("changePage", this.page);
        this.fetchImg(this.page);
      }
    });
  },

  render: function () {
    var movieCards = this.cardData.results;
    const template = document.getElementById("template").innerHTML;
    const rendered = Mustache.render(template, { movieCards });
    $("#movieCards").html(rendered);

    for (let i = 0; i < 20; i++) {
      $(".card").eq(i).attr("data-index", i);
    }
    this.clickOnCard();
  },
  fetchImg() {
    $.ajax({
      url:
        "https://api.themoviedb.org/3/trending/movie/week?api_key=b6fd81e534a2088db7e361082bf94045&page=" +
        this.page,
      success: (data) => {
        this.cardData = data;
        eventsMediator.emit("moviesLoaded", this.cardData);

        this.render();
      },
      error: function () {},
    });
  },

  clickOnCard() {
    $(".card").on("click", function () {
      let index = parseInt($(this).data("index"));
      eventsMediator.emit("cardClicked", index);
    });
    eventsMediator.on("cardClicked", (index) => {
      this.handleClick(index);
    });
  },

  handleClick(index) {
    var results = this.cardData.results[index];
    openPopup({
      title: results.original_title,
      rate: results.vote_average,
      votes: results.vote_count,
      desc: results.overview,
      img: results.poster_path,
    });
  },

  getcards() {
    return this.cardData;
  },
};

/*========================================= Stats Module ===================================*/

var statModule = {
  page: 1,

  init () {
    eventsMediator.on("changePage", (page) => {
      this.page = page;
    });

    eventsMediator.on("moviesLoaded", (data) => {
      $("#movieNum").text(data.results.length);
      $("#current-page").text(this.page);

      console.log(data)
      var maxRatingMovie = data.results.reduce((prev, current) => {
        return prev.vote_average > current.vote_average ? prev : current;
      });

      $("#rating").text(maxRatingMovie.vote_average);
      $("#top-rated").text(maxRatingMovie.original_title);
    });
  },
  search: function (maxRating) {
    for (let i = 0; i < Model.cardData.results.length; i++) {
      if (Model.cardData.results[i].vote_average === maxRating) {
        return Model.cardData.results[i].original_title;
      }
    }
  },
};

/*======================================================================================*/

function closePopup() {
  document.getElementById("PopUp").style.display = "none";
  document.body.style.overflowY = "visible";
}

function openPopup({ title, rate, votes, desc, img }) {
  document.getElementById("PopUp").style.display = "block";
  $(".movie-title").html(title);
  $(".rate").html(rate);
  $(".votes").html(votes);
  $(".description").html(desc);
  $(".wrapper img").attr(
    "src",
    "https://www.themoviedb.org/t/p/w300_and_h450_bestv2" + img
  );
  document.body.style.overflowY = "hidden";
}

statModule.init();
movieModule.init();
