import express from "express";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;
const db = new pg.Client({
	user: "postgres",
	host: "localhost",
	database: "book_notes",
	password: "yuganshu_postgres@789",
	port: 5432
});

db.connect();

var bookData = [];

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
	
	db.query("SELECT * FROM book_data", (err, result) => {
		if (err) {
			console.error("Error executing query", err.stack);
		}else {
			bookData = result.rows;			
		}
	});

	res.render("pages/index.ejs", {books: bookData});
});

app.get("/isbn", (req, res) => {
	res.render("pages/isbn_entry.ejs");
});

app.get("/add", (req, res) => {
	res.render("partials/add_or_edit.ejs")
});

app.get("/notes", (req, res) => {
	res.render("partials/book_notes.ejs")
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});