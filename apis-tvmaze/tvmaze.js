"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 *///
async function searchShow(query){
  try{ 
    let response = await axios.get(
      `http://api.tvmaze.com/search/shows?q=${query}`);
    const {data} = response;
    for(let {show} of data){
      return [{
        id: show.id,
        name: show.name,
        summary: show.summary,
        image: show.image.medium ? show.image.medium : "No image"
      }]
    }
  }catch(e){
  console.error(e);
  }
}
/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src=${show.image} 
              alt="Bletchly Circle San Francisco" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
$('#search-form').on('submit', handleSearch);
async function handleSearch(e){
  e.preventDefault();
  const word = $('#search-query').val();
  const show = await searchShow(word);
  populateShows(show);
}

function populateEpisodes(Array){
  $('#episodes-list').empty();
  for(let value of Array){
    $('#episodes-list').append(`<li>${value.name} (season ${value.season}, number ${value.number})`);
  }
  $("#episodes-area").show();
}

async function getEpisodes(id){
  const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  
  let episodes = res.data.map(val => ({
    id: val.id,
    name: val.name,
    season: val.season,
    number: val.number,
  }));
  return episodes;
}

$("#shows-list").on('click', ".Show-getEpisodes", async function handle(e){
  e.preventDefault();
  let Id = $(e.target).closest(".Show").data("show-id");
  let ep = await getEpisodes(Id);
  populateEpisodes(ep);
})

