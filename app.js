const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();
app.use(express.json());

module.exports = app;
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT * FROM movie ORDER BY movie_id;
    `;
  const movies = await db.all(getMoviesQuery);
  const newArray = [];
  for (let obj of movies) {
    newArray.push({ movieName: obj.movie_name });
  }
  response.send(newArray);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const createMovieQuery = `
          INSERT INTO
              movie (director_id,movie_name,lead_actor)
          VALUES
              (${directorId},
              '${movieName}',
              '${leadActor}')
      `;
  await db.run(createMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT * FROM movie WHERE movie_id = ${movieId};
    `;
  const movie = await db.get(getMovieQuery);
  const result = {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  };
  response.send(result);
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const createMovieQuery = `
          UPDATE
              movie
          SET
              director_id = ${directorId},
              movie_name = '${movieName}',
              lead_actor = '${leadActor}'
          WHERE movie_id = ${movieId}
      `;
  await db.run(createMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        DELETE FROM movie WHERE movie_id = ${movieId};
    `;
  await db.get(getMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getMoviesQuery = `
        SELECT * FROM director ORDER BY director_id;
    `;
  const director = await db.all(getMoviesQuery);
  const newArray = [];
  for (let obj of director) {
    newArray.push({
      directorId: obj.director_id,
      directorName: obj.director_name,
    });
  }
  response.send(newArray);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const newArray = [];
  const getMovieQuery = `
            SELECT * FROM movie WHERE director_id = ${directorId};
        `;
  const movies = await db.all(getMovieQuery);
  //   response.send(movies);
  for (let obj of movies) {
    newArray.push({ movieName: obj.movie_name });
  }
  response.send(newArray);
});
