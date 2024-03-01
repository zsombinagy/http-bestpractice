import express from "express";
import { z } from "zod";
import filesystem from "fs/promises";
import cors from "cors";

const server = express();
server.use(cors({"origin": "http://localhost:5173"}));
server.use(express.json());

const QueryParamSchema = z.object({
  min: z.coerce.number(),
  max: z.coerce.number(),
});

type Country = z.infer<typeof CountrySchema>;

const CountrySchema = z.object({
  id: z.number(),
  name: z.string(),
  population: z.number(),
});

const CreateCountrySchema = z.object({
  name: z.string(),
  population: z.number(),
});

const readFile = async () => {
  try {
    const rawData = await filesystem.readFile(
      `${__dirname}/../countries.json`,
      "utf-8"
    );
    const countries: Country[] = JSON.parse(rawData);
    return countries;
  } catch (error) {
    return null;
  }
};

server.get("/api/countries", async (req, res) => {
  const result = QueryParamSchema.safeParse(req.query);

  if (!result.success) {
    res.status(400).json(result.error.issues);
    return;
  }

 
  const countries = await readFile();
  if (countries === null) {
    res.sendStatus(500)
    return
  }

  const queryParam = result.data;

  const filteredCountries = countries.filter(
    (country) =>
      country.population > queryParam.min && country.population < queryParam.max
  );

  res.json(
    filteredCountries
  );
});
server.get("/api/cities", (req, res) => {
  res.json({
    data: ["Helsinki", "Koppenhága"],
  });
});

server.post("/api/countries", async (req, res) => {
  const result = CreateCountrySchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error.issues);
    return;
  }
  console.log(result.data);
  const countries = await readFile();
  if (countries === null) {
    res.sendStatus(500)
    return
  }
  const randomNumber = Math.random();
  countries.push({ ...result.data, id: randomNumber });

  await filesystem.writeFile(
    `${__dirname}/../countries.json`,
    JSON.stringify(countries, null, 2)
  );

  res.json({ id: randomNumber });
});

server.delete(`/api/countries/:id`, async (req, res) => {
  const id = +req.params.id;
  const countries = await readFile();
  if (countries === null) {
    res.sendStatus(500)
    return
  }
  const filteredCountries = countries.filter((country) => country.id !== id);

  await filesystem.writeFile(
    `${__dirname}/../countries.json`,
    JSON.stringify(filteredCountries, null, 2)
  );

  res.sendStatus(200);
});

server.patch(`/api/countries/:id`, async (req, res) => {
  const id = +req.params.id;

  const countries = await readFile();
  if (countries === null) {
    res.sendStatus(500)
    return
  }
  let countryToUpdate = countries.find((country) => country.id === id);
  
  if (!countryToUpdate) return res.sendStatus(404);

  const result = CreateCountrySchema.safeParse(req.body);
  if (!result.success) return res.status(400).json(result.error.issues);

  const updatedCountries = countries.map((country) => {
    if (country.id === id) {
      return { ...result.data, id };
    }
    return country;
  });

  await filesystem.writeFile(
    `${__dirname}/../countries.json`,
    JSON.stringify(updatedCountries, null, 2)
  );

  res.sendStatus(200);
});

server.listen(4001);
