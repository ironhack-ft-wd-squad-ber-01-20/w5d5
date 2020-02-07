const charactersAPI = new APIHandler("http://localhost:8000");

const createCard = character => {
  const characterDiv = document.createElement("div");
  characterDiv.classList.add("character-info");
  characterDiv.innerHTML = `
        <div class="id">Id<span>${character.id}</span></div>
        <div class="name">Character Name<span>${character.name}</span></div>
        <div class="occupation">Character Occupation<span>${character.occupation}</span></div>
        <div class="cartoon">Is a Cartoon?<span>${character.cartoon}</span></div>
        <div class="weapon">Character Weapon<span>${character.weapon}</span></div>
      `;

  return characterDiv;
};

window.addEventListener("load", () => {
  document
    .getElementById("fetch-all")
    .addEventListener("click", function(event) {
      charactersAPI.getFullList().then(response => {
        const containerDiv = document.querySelector(".characters-container");
        containerDiv.innerHTML = "";

        response.data.forEach(character => {
          const characterCard = createCard(character);

          containerDiv.appendChild(characterCard);
        });
      });
    });

  document
    .getElementById("fetch-one")
    .addEventListener("click", function(event) {
      const id = document.querySelector("#id-search").value;
      charactersAPI.getOneRegister(id).then(response => {
        console.log(response.data);
      });
    });

  document
    .getElementById("delete-one")
    .addEventListener("click", function(event) {});

  document
    .getElementById("edit-character-form")
    .addEventListener("submit", function(event) {});

  document
    .getElementById("new-character-form")
    .addEventListener("submit", function(event) {});
});
