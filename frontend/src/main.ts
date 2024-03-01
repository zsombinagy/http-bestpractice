import "./style.css";
import { z } from "zod";
import safeFetch from "./api";
const CountrySchema = z.object({
  id: z.number(),
  name: z.string(),
  population: z.number(),
});


const minElement = document.getElementById("min") as HTMLInputElement;
const maxElement = document.getElementById("max") as HTMLInputElement;
const searchButton = document.getElementById("search") as HTMLButtonElement;
const country_div = document.getElementById("country_list") as HTMLDivElement;
const updateInputsDiv = document.getElementById(
  "updateInputsDiv"
) as HTMLDivElement;
const deleteButtons = document.getElementsByClassName("deleteButtons");
const modifyButtons = document.getElementsByClassName("modifyButton");
const cancelButton = document.getElementById(
  "cancelButton"
) as HTMLButtonElement;
const saveButton = document.getElementById("saveButton") as HTMLButtonElement;
const updateNameInput = document.getElementById(
  "updateNameInput"
) as HTMLInputElement;
const updatePopulationInput = document.getElementById(
  "updatePopulationInput"
) as HTMLInputElement;

let countryID: null | number = null;
const hiddenModifyWindow = () => {
  (document.getElementById("updateInputsDiv") as HTMLDivElement).style.display =
    "none";
};


const displayModifyWindow = () => {
  (document.getElementById("updateInputsDiv") as HTMLDivElement).style.display =
    "flex";
};

const fetchData = async () => {
  if (!minElement.value || !maxElement.value) {
    return;
  }
  const response = await safeFetch(
    "get",
    `http://localhost:4001/api/countries?min=${minElement.value}&max=${maxElement.value}`
  );
  if (!response.success) {
    alert(response.status);
    return;
  }
  let countries = response.data;
  const result = CountrySchema.array().safeParse(countries);
  if (!result.success) {
    alert(result.error);
    return;
  }
  const validateData = result.data
  let countryArray = result.data
    .map(
      (country) =>
        `<p>${country.name}: population: ${country.population}</p><button class="deleteButtons btn btn-primary" id="${country.id}delete" >delete</button> <button id="${country.id}modify" class="modifyButton btn btn-accent">Modify</button>`
    )
    .join("");
  country_div.innerHTML = countryArray;

  for (let index = 0; index < deleteButtons.length; index++) {
    const button = deleteButtons[index];
    button.addEventListener("click", async () => {
      await deleteData(+button.id.split("delete")[0]);
      fetchData();
    });
  }

  for (let index = 0; index < modifyButtons.length; index++) {
    const button = modifyButtons[index];
    button.addEventListener("click", async () => {
      displayModifyWindow();
      countryID = +button.id.split("modify")[0];
      updateNameInput.value = validateData.find(country => {
      return  country.id === countryID
      })!.name
      updatePopulationInput.value = "" + validateData.find(country => {
      return  country.id === countryID
      })!.population

    });
  }
};

minElement.addEventListener("input", fetchData);
maxElement.addEventListener("input", fetchData);

searchButton.addEventListener("click", fetchData);
saveButton.addEventListener("click", async () => {
  await modifyData();

  hiddenModifyWindow()
  fetchData()


});

const countryNameInput = document.getElementById(
  "country_name_input"
) as HTMLInputElement;
const countryPopulationInput = document.getElementById(
  "country_population_input"
) as HTMLInputElement;
const sendButton = document.getElementById("post_request") as HTMLButtonElement;

cancelButton.addEventListener("click", hiddenModifyWindow);
const postData = async () => {
  const response = await safeFetch(
    "post",
    "http://localhost:4001/api/countries",
    {
      name: countryNameInput.value,
      population: +countryPopulationInput.value,
    }
  );
  if (response?.status === 200) {
    alert("success");
  } else alert("unsuccess");
};

sendButton.addEventListener("click", async () => {
  await postData();
  fetchData();
});

const deleteData = async (id: number) => {
  await safeFetch("delete", `http://localhost:4001/api/countries/${id}`);
};

const modifyData = async () => {
  await safeFetch("PATCH", `http://localhost:4001/api/countries/${countryID}`, {
    name: updateNameInput.value,
    population: +updatePopulationInput.value,
  });
};
