import supertest from "supertest";
import { getConnection } from "typeorm";

import app, { init } from "../../src/app";
import { getUnsavedToken, getValidToken } from "../factories/authFactory";
import { createManyPokemons } from "../factories/pokemonFactory";
import { catchManyPokemon } from "../factories/userPokemonsFactory";

import { clearDatabase } from "../utils/database";

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await clearDatabase();
});

afterAll(async () => {
    await getConnection().close();
});

describe("GET /pokemons", () => {
    it("should answer with status 200 for valid token", async () => {
        const tokenAndId = await getValidToken();
        const allPokemonsId = await createManyPokemons(4);
        const pokemonsToCatch = [allPokemonsId[0], allPokemonsId[3]];
        await catchManyPokemon(tokenAndId.userId, pokemonsToCatch);

        const response = await supertest(app)
            .get("/pokemons")
            .set("Authorization", `Bearer ${tokenAndId.token}`);
        expect(response.status).toBe(200);
    });

    it("should answer with status 401 for invalid token", async () => {
        const token = await getUnsavedToken();

        const response = await supertest(app)
            .get("/pokemons")
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(401);
    });
});
